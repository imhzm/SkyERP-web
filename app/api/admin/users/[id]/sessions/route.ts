import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
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
    const user = await User.findById(id).select("sessions refresh_tokens");
    if (!user) return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
    return Response.json({ sessions: user.sessions || [], refresh_tokens: user.refresh_tokens || [] });
  } catch (error) {
    console.error("Sessions error:", error);
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
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  try {
    await connectDB();

    const body = await request.json().catch(() => ({}));
    const sessionId = body.session_id;

    const update: Record<string, any> = { $set: { refresh_tokens: [] } };
    if (sessionId) {
      update.$pull = { sessions: { id: sessionId } };
    } else {
      update.$set.sessions = [];
    }

    await User.findByIdAndUpdate(id, update);

    const user = await User.findById(id).select("username");
    await writeAuditLog({
      target_collection: "users",
      action: "admin_force_logout",
      target_id: id,
      target_username: user?.username || null,
      performed_by: payload.email || "admin",
      performed_by_type: "admin",
      ip_address: ip,
      success: true,
      details: { force_all: !sessionId, session_id: sessionId || null },
    });

    return Response.json({ message: sessionId ? "تم إنهاء الجلسة" : "تم إنهاء كل الجلسات" });
  } catch (error) {
    console.error("Sessions delete error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
