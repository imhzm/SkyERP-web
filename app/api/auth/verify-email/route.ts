import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { hashToken } from "@/lib/auth";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

const verifiyEmailSchema = z.object({
  token: z.string().min(1, "رمز التحقق مطلوب"),
});

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = await checkRateLimit(`verify-email:${ip}`, "auth:verify-email");
  if (!rl.allowed) return getRateLimitResponse(rl.resetIn);

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "بيانات غير صالحة" }, { status: 400 }); }

  const parsed = verifiyEmailSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "رمز التحقق مطلوب" }, { status: 400 });
  }

  const token = parsed.data.token;
  if (!token) {
    return Response.json({ error: "رمز التحقق مطلوب" }, { status: 400 });
  }

  const tokenHash = hashToken(token);

  try {
    await connectDB();

    const tokenUser = await User.findOne({
      email_verification_token: tokenHash,
      is_deleted: { $ne: true },
    });

    if (!tokenUser) {
      return Response.json({ error: "رمز التحقق غير صالح" }, { status: 400 });
    }

    if (tokenUser.email_verified) {
      return Response.json({ message: "البريد الإلكتروني مُؤكّد بالفعل" });
    }

    if (tokenUser.email_verification_sent_at) {
      const elapsed = Date.now() - new Date(tokenUser.email_verification_sent_at).getTime();
      if (elapsed > TOKEN_TTL_MS) {
        return Response.json({
          error: "انتهت صلاحية رمز التحقق",
          expired: true,
        }, { status: 400 });
      }
    }

    const updated = await User.findOneAndUpdate(
      {
        _id: tokenUser._id,
        email_verified: false,
        email_verification_token: tokenHash,
      },
      {
        $set: {
          email_verified: true,
          email_verification_token: null,
          email_verification_sent_at: null,
        },
      },
      { new: true }
    );

    if (!updated) {
      return Response.json({ message: "البريد الإلكتروني مُؤكّد بالفعل" });
    }

    return Response.json({ message: "تم تأكيد البريد الإلكتروني بنجاح" });
  } catch (error) {
    console.error("Verify email error:", error);
    return Response.json({ error: "حدث خطأ أثناء التحقق" }, { status: 500 });
  }
}
