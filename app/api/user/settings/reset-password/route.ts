import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { generateToken, hashToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { getTokenFromRequest } from "@/lib/middleware";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";
import { writeAuditLog, toAuditRole } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.type !== "user") {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = await checkRateLimit(`settings-reset:${payload.sub}`, "auth:reset-password");
  if (!rl.allowed) return getRateLimitResponse(rl.resetIn);

  try {
    await connectDB();

    const user = await User.findOne({ _id: payload.sub, is_deleted: { $ne: true } });
    if (!user) {
      return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    if (user.password_hash?.startsWith("google_oauth:")) {
      return Response.json({ error: "حسابك مرتبط بـ Google، لا يمكن إعادة تعيين كلمة المرور" }, { status: 400 });
    }

    const token = generateToken();
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password_reset_token: hashToken(token),
          password_reset_expires: new Date(Date.now() + 60 * 60 * 1000),
        },
      }
    );

    const result = await sendPasswordResetEmail(user.email, token);
    if (!result.success) {
      return Response.json({ error: "فشل إرسال البريد، حاول لاحقًا" }, { status: 500 });
    }

    await writeAuditLog({
      target_collection: "users",
      action: "settings_reset_password",
      target_id: user._id.toString(),
      target_username: user.username,
      performed_by: user.email,
      performed_by_type: "user",
      actor_role: toAuditRole(user.role),
      organization_id: payload.organization_id,
      ip_address: ip,
      success: true,
    });

    return Response.json({ message: "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني" });
  } catch (error) {
    console.error("Settings reset password error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
