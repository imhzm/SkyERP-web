import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { writeAuditLog } from "@/lib/audit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireAdmin(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const lockDuration = typeof body.duration_minutes === "number" ? body.duration_minutes : 60;

    const user = await User.findById(id);
    if (!user) return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });

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
      ip_address: ip,
      success: true,
      details: { duration_minutes: lockDuration },
    });

    return Response.json({
      message: isCurrentlyLocked ? "تم فتح الحساب" : "تم قفل الحساب",
      locked: !isCurrentlyLocked,
    });
  } catch (error) {
    console.error("Lock user error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
