import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { generateSerialNumber } from "@/models/SerialNumber";
import { hashPassword, generateToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = checkRateLimit(`register:${ip}`, "auth:register");
  if (!rl.allowed) {
    return getRateLimitResponse(rl.resetIn);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return Response.json(
      { error: firstError.message, field: firstError.path[0] },
      { status: 400 }
    );
  }

  const { username, email, phone, password } = parsed.data;

  try {
    await connectDB();

    const existingUser = await User.findOne({
      $or: [
        { username_key: username.toLowerCase() },
        { email: email.toLowerCase() },
      ],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? "email" : "username";
      return Response.json(
        { error: field === "email" ? "البريد الإلكتروني مستخدم بالفعل" : "اسم المستخدم مستخدم بالفعل" },
        { status: 409 }
      );
    }

    const password_hash = hashPassword(password);
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const emailToken = generateToken();

    const serial = await generateSerialNumber();

    const user = await User.create({
      username,
      username_key: username.toLowerCase(),
      email: email.toLowerCase(),
      email_verified: false,
      email_verification_token: emailToken,
      email_verification_sent_at: now,
      password_hash,
      full_name: username,
      phone: phone || null,
      role: "client",
      account_type: "client",
      serial_number: serial,
      max_team_members: 0,
      is_active: true,
      activation: {
        status: "trial",
        trial_start: now,
        trial_end: trialEnd,
        max_devices: 1,
        subscription: {
          plan: "trial",
          start_date: now,
          end_date: trialEnd,
          auto_renew: false,
          grace_period_end: new Date(trialEnd.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      created_at: now,
      last_modified: now,
      sync_status: "synced",
    });

    await writeAuditLog({
      target_collection: "users",
      action: "register",
      target_id: user._id.toString(),
      target_username: username,
      performed_by: username,
      performed_by_type: "user",
      actor_role: "client",
      ip_address: ip,
      details: { plan: "trial", trial_end: trialEnd.toISOString() },
      success: true,
    });

    return Response.json(
      {
        message: "تم التسجيل بنجاح",
        user: {
          username: user.username,
          email: user.email,
          activation: user.activation,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json({ error: "حدث خطأ أثناء التسجيل" }, { status: 500 });
  }
}
