import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { getTokenFromRequest } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Plan } from "@/models/billing/Plan";
import { checkCascadingExpiry } from "@/lib/subscription";

interface VerifyUserResult {
  _id: mongoose.Types.ObjectId;
  is_deleted: boolean;
  is_active: boolean;
  account_type: string;
  owner_id?: mongoose.Types.ObjectId;
  hardware_hash?: string;
  activation?: Record<string, unknown> | null;
}

export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.type !== "user") {
    return Response.json({ error: "unauthorized", valid: false }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(payload.sub)
      .select("is_active activation account_type owner_id hardware_hash")
      .lean<VerifyUserResult | null>();
    if (!user || user.is_deleted) {
      return Response.json({ error: "user_not_found", valid: false }, { status: 404 });
    }

    const now = new Date();
    const activation: Record<string, unknown> = user.activation || {};
    const sub: Record<string, unknown> = (activation.subscription as Record<string, unknown>) || {};
    const status = (activation.status as string) || "trial";
    const planKey = (sub.plan as string) || "trial";

    let valid = true;
    let reason: string | null = null;

    if (!user.is_active) { valid = false; reason = "account_disabled"; }
    else if (status === "suspended") { valid = false; reason = "suspended"; }
    else if (status === "expired" || ((sub.end_date as string) && new Date(sub.end_date as string) < now)) {
      const graceEnd = (sub.grace_period_end as string) ? new Date(sub.grace_period_end as string) : null;
      if (!graceEnd || graceEnd < now) { valid = false; reason = "expired"; }
    }

    if (valid && user.account_type === "sub_user" && user.owner_id) {
      const cascading = await checkCascadingExpiry(user._id.toString());
      if (cascading.blocked) { valid = false; reason = cascading.reason || "owner_expired"; }
    }

    // 📦 Resolve allowed apps from Plan
    let allowedApps: string[] | "*" = "*";
    try {
      const plan = await Plan.findOne({ key: planKey }).select("allowed_apps").lean();
      if (plan) {
        allowedApps = (plan.allowed_apps as string[] | "*") || "*";
      }
    } catch {
      // fallback to all apps if plan lookup fails
    }

    return Response.json({
      valid,
      reason,
      hardware_bound: !!user.hardware_hash,
      server_time: now.toISOString(),
      plan: planKey,
      apps: allowedApps,
    });
  } catch (error) {
    console.error("Subscription verify error:", error);
    return Response.json({ error: "server_error", valid: false }, { status: 500 });
  }
}
