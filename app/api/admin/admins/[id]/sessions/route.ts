import { NextRequest } from "next/server";
import { requireFounder } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
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
    const admin = await Admin.findById(id).select("sessions refresh_tokens");
    if (!admin) return Response.json({ error: "المشرف غير موجود" }, { status: 404 });
    return Response.json({ sessions: [], refresh_tokens: admin.refresh_tokens || [] });
  } catch (error) {
    console.error("Admin sessions error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireFounder(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  try {
    await connectDB();
    const target = await Admin.findById(id);
    if (!target) return Response.json({ error: "المشرف غير موجود" }, { status: 404 });

    await Admin.findByIdAndUpdate(id, { $set: { refresh_tokens: [] } });

    await writeAuditLog({
      target_collection: "admin",
      action: "admin_force_logout_admin",
      target_id: id,
      target_username: target.email,
      performed_by: payload.email,
      performed_by_type: "admin",
      actor_role: "founder",
      ip_address: ip,
      success: true,
      details: { force_all: true },
    });

    return Response.json({ message: "تم إنهاء كل جلسات المشرف" });
  } catch (error) {
    console.error("Admin sessions delete error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
