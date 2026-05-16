import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "بيانات غير صالحة" }, { status: 400 }); }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return Response.json({ error: firstError.message }, { status: 400 });
  }

  const { token, password } = parsed.data;

  try {
    await connectDB();
    const user = await User.findOne({
      password_reset_token: token,
      password_reset_expires: { $gt: new Date() },
      is_deleted: { $ne: true },
    });

    if (!user) {
      return Response.json({ error: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية" }, { status: 400 });
    }

    user.password_hash = hashPassword(password);
    user.password_changed_at = new Date();
    user.password_reset_token = null;
    user.password_reset_expires = null;
    user.failed_login_attempts = 0;
    user.locked_until = null;
    user.refresh_tokens = [];
    await user.save();

    await writeAuditLog({
      target_collection: "users",
      action: "password_reset",
      target_id: user._id.toString(),
      target_username: user.username,
      performed_by: user.username,
      performed_by_type: "user",
      success: true,
    });

    return Response.json({ message: "تم إعادة تعيين كلمة المرور بنجاح" });
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
