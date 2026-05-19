import { NextRequest } from "next/server";
import { requireFounder } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import { hash } from "bcryptjs";
import { updateAdminSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireFounder(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;

  try {
    await connectDB();
    const admin = await Admin.findById(id).select("-password_hash -refresh_tokens");
    if (!admin) return Response.json({ error: "المشرف غير موجود" }, { status: 404 });

    return Response.json({
      admin: {
        id: admin._id.toString(), username: admin.username, email: admin.email,
        full_name: admin.full_name, role: admin.role, is_active: admin.is_active,
        last_login: admin.last_login, created_at: admin.created_at,
        notes: admin.notes, permissions: admin.permissions,
        two_factor_enabled: admin.two_factor_enabled,
      },
    });
  } catch (error) {
    console.error("Admin detail error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireFounder(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { id } = await params;

  try {
    await connectDB();
    const target = await Admin.findById(id);
    if (!target) return Response.json({ error: "المشرف غير موجود" }, { status: 404 });

    if (target.role === "founder") {
      return Response.json({ error: "لا يمكن تعديل المؤسس" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateAdminSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const update: Record<string, any> = {};
    if (parsed.data.full_name !== undefined) update.full_name = parsed.data.full_name;
    if (parsed.data.role !== undefined) update.role = parsed.data.role;
    if (parsed.data.is_active !== undefined) update.is_active = parsed.data.is_active;
    if (parsed.data.notes !== undefined) update.notes = parsed.data.notes;

    if (parsed.data.permissions) {
      for (const [key, val] of Object.entries(parsed.data.permissions)) {
        if (val !== undefined) {
          update[`permissions.${key}`] = val;
        }
      }
    }

    if (body.new_password && body.new_password.length >= 8) {
      update.password_hash = await hash(body.new_password, 12);
      update.refresh_tokens = [];
    }

    await Admin.updateOne({ _id: id }, { $set: update });

    await writeAuditLog({
      target_collection: "admin",
      action: "admin_update_admin",
      target_id: id,
      target_username: target.email,
      performed_by: payload.email,
      performed_by_type: "admin",
      actor_role: "founder",
      organization_id: payload.organization_id,
      ip_address: ip,
      details: { changes: Object.keys(update) },
      success: true,
    });

    return Response.json({ message: "تم تحديث المشرف بنجاح" });
  } catch (error) {
    console.error("Admin update error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireFounder(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { id } = await params;

  try {
    await connectDB();
    const target = await Admin.findById(id);
    if (!target) return Response.json({ error: "المشرف غير موجود" }, { status: 404 });

    if (target.role === "founder") {
      return Response.json({ error: "لا يمكن حذف المؤسس" }, { status: 403 });
    }

    if (target._id.toString() === payload.sub) {
      return Response.json({ error: "لا يمكن حذف نفسك" }, { status: 403 });
    }

    await Admin.deleteOne({ _id: id });

    await writeAuditLog({
      target_collection: "admin",
      action: "admin_delete_admin",
      target_id: id,
      target_username: target.email,
      performed_by: payload.email,
      performed_by_type: "admin",
      actor_role: "founder",
      organization_id: payload.organization_id,
      ip_address: ip,
      success: true,
    });

    return Response.json({ message: "تم حذف المشرف بنجاح" });
  } catch (error) {
    console.error("Admin delete error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
