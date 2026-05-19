import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { generateToken, hashToken } from "@/lib/auth";
import { forgotPasswordSchema } from "@/lib/validation";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = await checkRateLimit(`forgot:${ip}`, "auth:forgot-password");
  if (!rl.allowed) return getRateLimitResponse(rl.resetIn);

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "بيانات غير صالحة" }, { status: 400 }); }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "البريد الإلكتروني غير صالح" }, { status: 400 });
  }

  const genericMessage = "إذا كان البريد مسجلاً لدينا، سيتم إرسال رابط إعادة تعيين كلمة المرور";

  try {
    await connectDB();
    const user = await User.findOne({ email: parsed.data.email.toLowerCase(), is_deleted: { $ne: true } });
    if (!user) {
      return Response.json({ message: genericMessage });
    }

    if (user.password_hash?.startsWith("google_oauth:")) {
      return Response.json({ message: genericMessage });
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

    await sendPasswordResetEmail(user.email, token);

    return Response.json({ message: genericMessage });
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
