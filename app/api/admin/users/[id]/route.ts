import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { updateUserSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireAdmin(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;

  try {
    await connectDB();
    const user = await User.findById(id).select("-password_hash -refresh_tokens");
    if (!user || user.is_deleted) {
      return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    return Response.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,
        email_verified: user.email_verified,
        hardware_hash: user.hardware_hash,
        hardware_first_login: user.hardware_first_login,
        hardware_info: user.hardware_info,
        activation: user.activation,
        failed_login_attempts: user.failed_login_attempts,
        locked_until: user.locked_until,
        sessions: user.sessions?.slice(-10) || [],
        audit_log: user.audit_log?.slice(-50) || [],
        created_at: user.created_at,
        last_login: user.last_login,
        last_modified: user.last_modified,
        linked_employee_id: user.linked_employee_id,
        linked_employee_code: user.linked_employee_code,
      },
    });
  } catch (error) {
    console.error("Admin get user error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireAdmin(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "بيانات غير صالحة" }, { status: 400 }); }

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await User.findById(id);
    if (!user || user.is_deleted) {
      return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const { activation_status, ...fields } = parsed.data;
    const update: Record<string, any> = { last_modified: new Date() };

    if (fields.full_name !== undefined) update.full_name = fields.full_name;
    if (fields.phone !== undefined) update.phone = fields.phone || null;
    if (fields.role !== undefined) update.role = fields.role;
    if (fields.is_active !== undefined) update.is_active = fields.is_active;

    if (activation_status) {
      update["activation.status"] = activation_status;
    }

    await User.updateOne({ _id: id }, { $set: update });

    await writeAuditLog({
      target_collection: "users",
      action: "admin_update_user",
      target_id: id,
      target_username: user.username,
      performed_by: payload.email,
      performed_by_type: "admin",
      details: { changes: parsed.data },
      success: true,
    });

    return Response.json({ message: "تم تحديث المستخدم بنجاح" });
  } catch (error) {
    console.error("Admin update user error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireAdmin(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;

  try {
    await connectDB();
    const user = await User.findById(id);
    if (!user || user.is_deleted) {
      return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    await User.updateOne(
      { _id: id },
      { $set: { is_deleted: true, is_active: false, last_modified: new Date() } }
    );

    await writeAuditLog({
      target_collection: "users",
      action: "admin_delete_user",
      target_id: id,
      target_username: user.username,
      performed_by: payload.email,
      performed_by_type: "admin",
      success: true,
    });

    return Response.json({ message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
