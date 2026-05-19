import { NextRequest } from "next/server";
import { getTokenFromRequest } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { hashPassword, verifyPassword, clearAuthCookies } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validation";
import { writeAuditLog, toAuditRole } from "@/lib/audit";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.type !== "user") {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }

  const rl = await checkRateLimit(`change-pw:${payload.sub}`, "auth:change-password");
  if (!rl.allowed) return getRateLimitResponse(rl.resetIn);

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "بيانات غير صالحة" }, { status: 400 }); }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return Response.json({ error: firstError.message }, { status: 400 });
  }

  const { current_password, new_password } = parsed.data;
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  try {
    await connectDB();

    const user = await User.findById(payload.sub);
    if (!user) {
      return Response.json({ error: "غير موجود" }, { status: 404 });
    }

    if (user.password_hash?.startsWith("google_oauth:")) {
      return Response.json({ error: "حسابك مرتبط بـ Google، لا يمكن تغيير كلمة المرور من هنا" }, { status: 400 });
    }

    if (!verifyPassword(current_password, user.password_hash)) {
      return Response.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
    }

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password_hash: hashPassword(new_password),
          password_changed_at: new Date(),
          failed_login_attempts: 0,
          locked_until: null,
          refresh_tokens: [],
          sessions: [],
        },
      },
    );

    await writeAuditLog({
      target_collection: "users",
      action: "change_password",
      target_id: user._id.toString(),
      target_username: user.username,
      performed_by: user.email,
      performed_by_type: "user",
      actor_role: toAuditRole(user.role),
      organization_id: payload.organization_id,
      ip_address: ip,
      success: true,
    });

    await clearAuthCookies();

    return Response.json({ message: "تم تغيير كلمة المرور بنجاح، يرجى تسجيل الدخول مرة أخرى" });
  } catch (error) {
    console.error("Change password error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
