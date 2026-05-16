import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { generateToken } from "@/lib/auth";
import { forgotPasswordSchema } from "@/lib/validation";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = checkRateLimit(`forgot:${ip}`, "auth:forgot-password");
  if (!rl.allowed) return getRateLimitResponse(rl.resetIn);

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "بيانات غير صالحة" }, { status: 400 }); }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "البريد الإلكتروني غير صالح" }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await User.findOne({ email: parsed.data.email.toLowerCase(), is_deleted: { $ne: true } });
    if (!user) {
      return Response.json({ message: "إذا كان البريد موجودًا، سيتم إرسال رابط إعادة تعيين كلمة المرور" });
    }

    const token = generateToken();
    user.password_reset_token = token;
    user.password_reset_expires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    console.log(`Password reset link for ${user.email}: https://erp.skywaveads.com/reset-password?token=${token}`);

    return Response.json({ message: "إذا كان البريد موجودًا، سيتم إرسال رابط إعادة تعيين كلمة المرور" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
