import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import { compare, hash } from "bcryptjs";
import { writeAuditLog } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const payload = requireAdmin(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  try {
    await connectDB();
    const admin = await Admin.findById(payload.sub).select("-password_hash -refresh_tokens");
    if (!admin) return Response.json({ error: "غير موجود" }, { status: 404 });

    return Response.json({
      admin: {
        id: admin._id.toString(), email: admin.email, full_name: admin.full_name,
        role: admin.role, is_active: admin.is_active, last_login: admin.last_login, created_at: admin.created_at,
        permissions: admin.permissions, notes: admin.notes, two_factor_enabled: admin.two_factor_enabled,
      },
    });
  } catch (error) {
    console.error("Admin me error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const payload = requireAdmin(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  try {
    await connectDB();
    const body = await request.json();

    // Password change
    if (body.current_password && body.new_password) {
      const admin = await Admin.findById(payload.sub);
      if (!admin) return Response.json({ error: "غير موجود" }, { status: 404 });

      const valid = await compare(body.current_password, admin.password_hash);
      if (!valid) return Response.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });

      if (body.new_password.length < 8) {
        return Response.json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }, { status: 400 });
      }

      const newHash = await hash(body.new_password, 12);
      admin.password_hash = newHash;
      admin.refresh_tokens = [];
      await admin.save();

      await writeAuditLog({
        target_collection: "admin",
        action: "admin_change_password",
        target_id: payload.sub,
        performed_by: payload.email || "admin",
        performed_by_type: "admin",
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        success: true,
      });

      return Response.json({ message: "تم تغيير كلمة المرور" });
    }

    // Profile update
    const updates: Record<string, any> = {};
    if (body.full_name !== undefined) updates.full_name = body.full_name;
    if (body.role) updates.role = body.role;

    const admin = await Admin.findByIdAndUpdate(payload.sub, { $set: updates }, { new: true }).select("-password_hash -refresh_tokens");
    if (!admin) return Response.json({ error: "غير موجود" }, { status: 404 });

    return Response.json({
      admin: {
        id: admin._id.toString(), email: admin.email, full_name: admin.full_name,
        role: admin.role, is_active: admin.is_active, last_login: admin.last_login, created_at: admin.created_at,
        permissions: admin.permissions, notes: admin.notes, two_factor_enabled: admin.two_factor_enabled,
      },
    });
  } catch (error) {
    console.error("Admin update error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
