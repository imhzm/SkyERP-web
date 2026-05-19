import { NextRequest } from "next/server";
import { getTokenFromRequest } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User, IUser } from "@/models/User";
import { writeAuditLog, toAuditRole } from "@/lib/audit";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.type !== "user") {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }

  const sessionId = (await params).id;
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  try {
    await connectDB();

    const user = await User.findById(payload.sub);
    if (!user || user.is_deleted) {
      return Response.json({ error: "غير موجود" }, { status: 404 });
    }

    const sessionExists = (user.sessions as IUser["sessions"]).some((s) => s.id === sessionId);
    if (!sessionExists) {
      return Response.json({ error: "الجلسة غير موجودة" }, { status: 404 });
    }

    await User.updateOne(
      { _id: user._id },
      {
        $pull: { sessions: { id: sessionId } },
        $set: { refresh_tokens: [] },
      }
    );

    await writeAuditLog({
      target_collection: "users",
      action: "user_end_session",
      target_id: user._id.toString(),
      target_username: user.username,
      performed_by: user.email,
      performed_by_type: "user",
      actor_role: toAuditRole(user.role),
      organization_id: payload.organization_id,
      ip_address: ip,
      success: true,
      details: { session_id: sessionId },
    });

    return Response.json({ message: "تم إنهاء الجلسة" });
  } catch (error) {
    console.error("Delete session error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
