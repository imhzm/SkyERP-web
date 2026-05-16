import { NextRequest } from "next/server";
import { getTokenFromRequest } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { checkCascadingExpiry, syncTeamSubscriptionStatus } from "@/lib/subscription";

export async function GET(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.type !== "user") {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(payload.sub)
      .select("username email role account_type is_active activation owner_id team_members max_team_members serial_number")
      .lean();

    if (!user || (user as any).is_deleted) {
      return Response.json({ error: "غير موجود" }, { status: 404 });
    }

    const u = user as any;
    const now = new Date();
    const activation = u.activation || {};
    const sub = activation.subscription || {};

    const status = activation.status || "trial";
    const endDate = sub.end_date ? new Date(sub.end_date) : null;
    const trialEnd = activation.trial_end ? new Date(activation.trial_end) : null;

    let computedStatus = status;
    if (status === "trial" && trialEnd && trialEnd < now) computedStatus = "expired";
    else if (status === "active" && endDate && endDate < now) {
      const graceEnd = sub.grace_period_end ? new Date(sub.grace_period_end) : null;
      computedStatus = graceEnd && graceEnd > now ? "grace" : "expired";
    }

    const daysLeft = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : (trialEnd ? Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : null);

    // For sub_users, check owner status
    let cascading = null;
    if (u.account_type === "sub_user" && u.owner_id) {
      const check = await checkCascadingExpiry(u._id.toString());
      cascading = { blocked: check.blocked, reason: check.reason };
    }

    return Response.json({
      subscription: {
        status: computedStatus,
        raw_status: status,
        plan: sub.plan || "trial",
        start_date: sub.start_date || null,
        end_date: sub.end_date || null,
        days_left: daysLeft,
        grace_period_end: sub.grace_period_end || null,
        max_devices: activation.max_devices || 1,
        auto_renew: sub.auto_renew || false,
      },
      account: {
        type: u.account_type || "client",
        serial_number: u.serial_number || null,
        is_active: u.is_active,
        is_deleted: false,
      },
      team: u.account_type === "client" ? {
        used: (u.team_members || []).length,
        max: u.max_team_members || 0,
        remaining: Math.max(0, (u.max_team_members || 0) - (u.team_members || []).length),
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
