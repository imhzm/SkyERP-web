import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { hashPassword, hashToken } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = await checkRateLimit(`reset-pw:${ip}`, "auth:reset-password");
  if (!rl.allowed) return getRateLimitResponse(rl.resetIn);

  const body = await request.json();

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return Response.json({ error: firstError.message }, { status: 400 });
  }

  const { token, password } = parsed.data;

  try {
    await connectDB();

    const user = await User.findOneAndUpdate(
      {
        password_reset_token: hashToken(token),
        password_reset_expires: { $gt: new Date() },
        is_deleted: { $ne: true },
      },
      {
        $set: {
          password_reset_token: null,
          password_reset_expires: null,
          password_hash: hashPassword(password),
          password_changed_at: new Date(),
          email_verified: true,
          failed_login_attempts: 0,
          locked_until: null,
          refresh_tokens: [],
          sessions: [],
        },
      },
      { new: false }
    );

    if (!user) {
      return Response.json({ error: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية" }, { status: 400 });
    }

    await writeAuditLog({
      target_collection: "users",
      action: "password_reset",
      target_id: user._id.toString(),
      target_username: user.username,
      performed_by: user.email,
      performed_by_type: "user",
      actor_role: "client",
      ip_address: ip,
      success: true,
    });

    return Response.json({ message: "تم إعادة تعيين كلمة المرور بنجاح" });
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
