import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import { generateSerialNumber } from "@/models/SerialNumber";
import { hashPassword, generateToken, hashToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";
import { isMultiTenant, slugify } from "@/lib/organization";
import { DEFAULT_ORG_SETTINGS } from "@/lib/org-settings-defaults";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = await checkRateLimit(`register:${ip}`, "auth:register");
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
      return Response.json(
        { error: "اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل" },
        { status: 409 }
      );
    }

    const password_hash = hashPassword(password);
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const emailToken = generateToken();

    const serial = await generateSerialNumber();

    const user = await User.create({
      username,
      username_key: username.toLowerCase(),
      email: email.toLowerCase(),
      email_verified: false,
      email_verification_token: hashToken(emailToken),
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

    if (isMultiTenant()) {
      const orgSlug = slugify(username);
      const org = await Organization.create({
        name: username,
        slug: orgSlug,
        owner_id: user._id,
        admins: [{ user_id: user._id, role: "owner" as const, added_at: now }],
        settings: {
          ...DEFAULT_ORG_SETTINGS,
          company_name: "",
          company_phone: phone || "",
          company_email: email.toLowerCase(),
        },
        subscription: {
          plan: "trial",
          status: "trial",
          start_date: now,
          end_date: trialEnd,
          auto_renew: false,
          grace_period_end: new Date(trialEnd.getTime() + 7 * 24 * 60 * 60 * 1000),
          trial_start: now,
          trial_end: trialEnd,
        },
        limits: { max_users: 1, max_devices: 1 },
        serial_number: serial,
        is_active: true,
        created_at: now,
        updated_at: now,
      });
      await User.updateOne({ _id: user._id }, { $set: { organization_id: org._id } });
    }

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

    const emailResult = await sendVerificationEmail(email.toLowerCase(), emailToken);

    return Response.json(
      {
        message: emailResult.success
          ? "تم التسجيل بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب"
          : "تم التسجيل بنجاح",
        email_verification_sent: emailResult.success,
        user: {
          username: user.username,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json({ error: "حدث خطأ أثناء التسجيل" }, { status: 500 });
  }
}
