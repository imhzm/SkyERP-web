import { NextRequest } from "next/server";
import { getTokenFromRequest } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validation";
import { clearAuthCookies } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.type !== "user") {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "بيانات غير صالحة" }, { status: 400 }); }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return Response.json({ error: firstError.message }, { status: 400 });
  }

  const { current_password, new_password } = parsed.data;

  try {
    await connectDB();
    const user = await User.findById(payload.sub);
    if (!user) {
      return Response.json({ error: "غير موجود" }, { status: 404 });
    }

    if (!verifyPassword(current_password, user.password_hash)) {
      return Response.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
    }

    user.password_hash = hashPassword(new_password);
    user.password_changed_at = new Date();
    user.failed_login_attempts = 0;
    user.locked_until = null;
    user.refresh_tokens = [];
    await user.save();

    await clearAuthCookies();

    return Response.json({ message: "تم تغيير كلمة المرور بنجاح، يرجى تسجيل الدخول مرة أخرى" });
  } catch (error) {
    console.error("Change password error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
