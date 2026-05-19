import { NextRequest } from "next/server";
import { requireAdminOrFounder } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { updateSubscriptionSchema } from "@/lib/validation";
import { writeAuditLog, toAuditRole } from "@/lib/audit";
import { syncTeamSubscriptionStatus } from "@/lib/subscription";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "ØºÙŠØ± Ù…ØµØ±Ø­" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Ø¨ÙŠØ§Ù†Ø§Øª ØºÙŠØ± ØµØ§Ù„Ø­Ø©" }, { status: 400 }); }

  const parsed = updateSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { plan, start_date, end_date, auto_renew } = parsed.data;

  try {
    await connectDB();
    const user = await User.findById(id);
    if (!user || user.is_deleted) {
      return Response.json({ error: "Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯" }, { status: 404 });
    }

    const now = new Date();
    const update: Record<string, any> = { last_modified: now };
    update["activation.subscription.plan"] = plan;

    if (start_date) update["activation.subscription.start_date"] = new Date(start_date);
    if (end_date !== undefined) {
      update["activation.subscription.end_date"] = end_date ? new Date(end_date) : null;
    }
    if (auto_renew !== undefined) update["activation.subscription.auto_renew"] = auto_renew;

    if (plan !== "trial") {
      update["activation.status"] = "active";
    }

    if (end_date) {
      const end = new Date(end_date);
      update["activation.subscription.grace_period_end"] = new Date(end.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    await User.updateOne({ _id: id }, { $set: update });

    await writeAuditLog({
      target_collection: "users",
      action: "admin_update_subscription",
      target_id: id,
      target_username: user.username,
      performed_by: payload.email,
      performed_by_type: "admin",
      actor_role: toAuditRole(payload.role),
      organization_id: payload.organization_id,
      details: { plan, start_date, end_date, auto_renew },
      success: true,
    });

    const syncResult = await syncTeamSubscriptionStatus(id);
    if (syncResult.updated > 0) {
      console.log(`Synced ${syncResult.updated} team members for user ${id}`);
    }

    return Response.json({ message: "ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ Ø¨Ù†Ø¬Ø§Ø­", team_synced: syncResult.updated });
  } catch (error) {
    console.error("Admin update subscription error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£" }, { status: 500 });
  }
}
