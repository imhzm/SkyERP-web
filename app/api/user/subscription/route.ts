import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { getTokenFromRequest } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { checkCascadingExpiry, syncTeamSubscriptionStatus } from "@/lib/subscription";

interface SubUserResult {
  _id: mongoose.Types.ObjectId;
  is_deleted: boolean;
  account_type: string;
  owner_id?: mongoose.Types.ObjectId;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  activation: Record<string, unknown> | null;
  team_members?: mongoose.Types.ObjectId[];
  max_team_members?: number;
  serial_number?: string;
}

export async function GET(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.type !== "user") {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(payload.sub)
      .select("username email role account_type is_active activation owner_id team_members max_team_members serial_number")
      .lean<SubUserResult | null>();

    if (!user || user.is_deleted) {
      return Response.json({ error: "غير موجود" }, { status: 404 });
    }
    const now = new Date();
    const activation: Record<string, unknown> = user.activation || {};
    const sub: Record<string, unknown> = (activation.subscription as Record<string, unknown>) || {};

    const status = (activation.status as string) || "trial";
    const endDate = (sub.end_date as string) ? new Date(sub.end_date as string) : null;
    const trialEnd = (activation.trial_end as string) ? new Date(activation.trial_end as string) : null;

    let computedStatus = status;
    if (status === "trial" && trialEnd && trialEnd < now) computedStatus = "expired";
    else if (status === "active" && endDate && endDate < now) {
      const graceEnd = (sub.grace_period_end as string) ? new Date(sub.grace_period_end as string) : null;
      computedStatus = graceEnd && graceEnd > now ? "grace" : "expired";
    }

    const daysLeft = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : (trialEnd ? Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : null);

    // For sub_users, check owner status
    let cascading = null;
    if (user.account_type === "sub_user" && user.owner_id) {
      const check = await checkCascadingExpiry(user._id.toString());
      cascading = { blocked: check.blocked, reason: check.reason };
    }

    return Response.json({
      subscription: {
        status: computedStatus,
        plan: (sub.plan as string) || "trial",
        start_date: (sub.start_date as string) || null,
        end_date: (sub.end_date as string) || null,
        days_left: daysLeft,
        grace_period_end: (sub.grace_period_end as string) || null,
        max_devices: (activation.max_devices as number) || 1,
        auto_renew: (sub.auto_renew as boolean) || false,
      },
      account: {
        type: user.account_type || "client",
        is_active: user.is_active,
        is_deleted: false,
      },
      team: user.account_type === "client" ? {
        used: (user.team_members || []).length,
        max: user.max_team_members || 0,
        remaining: Math.max(0, (user.max_team_members || 0) - (user.team_members || []).length),
      } : null,
      cascading,
      server_time: now.toISOString(),
    });
  } catch (error) {
    console.error("Subscription info error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.type !== "user") {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(payload.sub);
    if (!user || user.is_deleted) {
      return Response.json({ error: "غير موجود" }, { status: 404 });
    }

    if (user.account_type !== "client") {
      return Response.json({ error: "غير مصرح" }, { status: 403 });
    }

    const result = await syncTeamSubscriptionStatus(user._id.toString());
    return Response.json({ message: "تمت المزامنة", updated: result.updated });
  } catch (error) {
    console.error("Subscription sync error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
