import { NextRequest } from "next/server";
import { requireFounder } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import { writeAuditLog } from "@/lib/audit";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireFounder(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  const rl = await checkRateLimit(`admin-lock-admin:${ip}`, "api:admin-mutate");
  if (!rl.allowed) return getRateLimitResponse(rl.resetIn);

  try {
    await connectDB();
    const target = await Admin.findById(id);
    if (!target) return Response.json({ error: "المشرف غير موجود" }, { status: 404 });

    if (target.role === "founder") {
      return Response.json({ error: "لا يمكن قفل المؤسس" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const lockDuration = typeof body.duration_minutes === "number" ? body.duration_minutes : 60;
    const isCurrentlyLocked = target.locked_until && new Date(target.locked_until) > new Date();

    if (isCurrentlyLocked) {
      await Admin.findByIdAndUpdate(id, { $set: { locked_until: null } });
    } else {
      await Admin.findByIdAndUpdate(id, {
        $set: { locked_until: new Date(Date.now() + lockDuration * 60 * 1000) },
      });
    }

    await writeAuditLog({
      target_collection: "admin",
      action: isCurrentlyLocked ? "admin_unlock_admin" : "admin_lock_admin",
      target_id: id,
      target_username: target.email,
      performed_by: payload.email,
      performed_by_type: "admin",
      actor_role: "founder",
      organization_id: payload.organization_id,
      ip_address: ip,
      success: true,
      details: { duration_minutes: lockDuration },
    });

    return Response.json({
      message: isCurrentlyLocked ? "تم فتح الحساب" : "تم قفل الحساب",
      locked: !isCurrentlyLocked,
    });
  } catch (error) {
    console.error("Lock admin error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
