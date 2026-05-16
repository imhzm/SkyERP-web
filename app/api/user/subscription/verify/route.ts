import { NextRequest } from "next/server";
import { getTokenFromRequest } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { checkCascadingExpiry } from "@/lib/subscription";

export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.type !== "user") {
    return Response.json({ error: "unauthorized", valid: false }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(payload.sub).select("is_active activation account_type owner_id hardware_hash").lean();
    if (!user || (user as any).is_deleted) {
      return Response.json({ error: "user_not_found", valid: false }, { status: 404 });
    }

    const u = user as any;
    const now = new Date();
    const activation = u.activation || {};
    const sub = activation.subscription || {};
    const status = activation.status || "trial";

    let valid = true;
    let reason: string | null = null;

    if (!u.is_active) { valid = false; reason = "account_disabled"; }
    else if (status === "suspended") { valid = false; reason = "suspended"; }
    else if (status === "expired" || (sub.end_date && new Date(sub.end_date) < now)) {
      const graceEnd = sub.grace_period_end ? new Date(sub.grace_period_end) : null;
      if (!graceEnd || graceEnd < now) { valid = false; reason = "expired"; }
    }

    if (valid && u.account_type === "sub_user" && u.owner_id) {
      const cascading = await checkCascadingExpiry(u._id.toString());
      if (cascading.blocked) { valid = false; reason = cascading.reason || "owner_expired"; }
    }

    return Response.json({
      valid,
      reason,
      hardware_bound: !!u.hardware_hash,
      server_time: now.toISOString(),
    });
  } catch (error) {
    console.error("Subscription verify error:", error);
    return Response.json({ error: "server_error", valid: false }, { status: 500 });
  }
}
