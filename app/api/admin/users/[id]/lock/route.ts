import { NextRequest } from "next/server";
import { requireAdminOrFounder } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { writeAuditLog, toAuditRole } from "@/lib/audit";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = await checkRateLimit(`admin-lock:${ip}`, "api:admin-mutate");
  if (!rl.allowed) return getRateLimitResponse(rl.resetIn);

  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const lockDuration = typeof body.duration_minutes === "number" ? body.duration_minutes : 60;

    const user = await User.findById(id);
    if (!user) return Response.json({ error: "Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯" }, { status: 404 });

    const isCurrentlyLocked = user.locked_until && new Date(user.locked_until) > new Date();

    if (isCurrentlyLocked) {
      await User.findByIdAndUpdate(id, { $set: { locked_until: null } });
    } else {
      await User.findByIdAndUpdate(id, {
        $set: { locked_until: new Date(Date.now() + lockDuration * 60 * 1000) },
      });
    }

    await writeAuditLog({
      target_collection: "users",
      action: isCurrentlyLocked ? "admin_unlock_user" : "admin_lock_user",
      target_id: id,
      target_username: user.username,
      performed_by: payload.email || "admin",
      performed_by_type: "admin",
      actor_role: toAuditRole(payload.role),
      organization_id: payload.organization_id,
      ip_address: ip,
      success: true,
      details: { duration_minutes: lockDuration },
    });

    return Response.json({
      message: isCurrentlyLocked ? "ØªÙ… ÙØªØ­ Ø§Ù„Ø­Ø³Ø§Ø¨" : "ØªÙ… Ù‚ÙÙ„ Ø§Ù„Ø­Ø³Ø§Ø¨",
      locked: !isCurrentlyLocked,
    });
  } catch (error) {
    console.error("Lock user error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£" }, { status: 500 });
  }
}
