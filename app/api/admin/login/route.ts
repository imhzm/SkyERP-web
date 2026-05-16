import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import { compare } from "bcryptjs";
import { signAccessToken, signRefreshToken, hashToken, setAuthCookies } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validation";
import { checkRateLimit, resetRateLimit, getRateLimitResponse } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "بيانات غير صالحة" }, { status: 400 }); }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
  }

  const { email, password } = parsed.data;

  try {
    await connectDB();

    const admin = await Admin.findOne({ email: email.toLowerCase(), is_active: true });
    if (!admin) {
      return Response.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    const rl = checkRateLimit(`admin:${admin._id}`, "auth:admin-login");
    if (!rl.allowed) return getRateLimitResponse(rl.resetIn);

    if (admin.locked_until && new Date() < admin.locked_until) {
      return Response.json({ error: "الحساب مقفل مؤقتًا" }, { status: 423 });
    }

    const valid = await compare(password, admin.password_hash);
    if (!valid) {
      const attempts = (admin.login_attempts || 0) + 1;
      const update: Record<string, any> = { login_attempts: attempts };
      if (attempts >= 3) {
        update.locked_until = new Date(Date.now() + 60 * 60 * 1000);
      }
      await Admin.updateOne({ _id: admin._id }, { $set: update });
      return Response.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    await Admin.updateOne(
      { _id: admin._id },
      { $set: { login_attempts: 0, locked_until: null, last_login: new Date() } }
    );
    resetRateLimit(`admin:${admin._id}`);

    const accessToken = signAccessToken({ sub: admin._id.toString(), type: "admin", role: "super_admin", email: admin.email });
    const refreshToken = signRefreshToken({ sub: admin._id.toString(), type: "admin" });
    const refreshHash = hashToken(refreshToken);

    await Admin.updateOne(
      { _id: admin._id },
      {
        $push: {
          refresh_tokens: {
            $each: [{ token_hash: refreshHash, device_info: "", ip, created_at: new Date(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }],
            $slice: -5,
          },
        },
      }
    );

    await setAuthCookies(accessToken, refreshToken);

    await writeAuditLog({
      target_collection: "admin",
      action: "admin_login",
      target_id: admin._id.toString(),
      performed_by: admin.email,
      performed_by_type: "admin",
      ip_address: ip,
      success: true,
    });

    return Response.json({
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
