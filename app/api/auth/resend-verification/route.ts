import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { generateToken, hashToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";
import { emailSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const parsed = emailSchema.safeParse((body as Record<string, unknown>)?.email);
  const email = parsed.success ? parsed.data : null;
  if (!email) {
    return Response.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = await checkRateLimit(`resend:${email}`, "auth:resend");
  if (!rl.allowed) {
    return getRateLimitResponse(rl.resetIn);
  }
  const ipRl = await checkRateLimit(`resend-ip:${ip}`, "auth:resend");
  if (!ipRl.allowed) {
    return getRateLimitResponse(ipRl.resetIn);
  }

  try {
    await connectDB();

    const user = await User.findOne({ email, is_deleted: { $ne: true } });
    if (!user) {
      return Response.json({ message: "إذا كان البريد الإلكتروني مسجلاً لدينا، تم إرسال رابط التحقق" });
    }

    if (user.email_verified) {
      return Response.json({ message: "إذا كان البريد الإلكتروني مسجلاً لدينا، تم إرسال رابط التحقق" });
    }

    const token = generateToken();
    const now = new Date();

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          email_verification_token: hashToken(token),
          email_verification_sent_at: now,
        },
      },
    );

    const result = await sendVerificationEmail(email, token);
    if (!result.success) {
      return Response.json({ error: "فشل إرسال البريد، حاول لاحقًا" }, { status: 500 });
    }

    return Response.json({ message: "تم إرسال رابط التحقق إلى بريدك الإلكتروني" });
  } catch (error) {
    console.error("Resend verification error:", error);
    return Response.json({ error: "حدث خطأ أثناء إعادة الإرسال" }, { status: 500 });
  }
}
