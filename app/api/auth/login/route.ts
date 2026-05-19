import { NextRequest } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import { verifyPassword, signAccessToken, signRefreshToken, hashToken, setAuthCookies } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { checkRateLimit, resetRateLimit, getRateLimitResponse } from "@/lib/rate-limit";
import { checkCascadingExpiry } from "@/lib/subscription";
import { isMultiTenant } from "@/lib/organization";
import { writeAuditLog, toAuditRole } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "";

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
      { status: 401 }
    );
  }

  const { email, password } = parsed.data;
  const rateLimitKey = `login:${email.toLowerCase()}:${ip}`;

  try {
    await connectDB();

    const rl = await checkRateLimit(rateLimitKey, "auth:login");
    if (!rl.allowed) {
      return getRateLimitResponse(rl.resetIn);
    }

    const user = await User.findOne({ email: email.toLowerCase(), is_deleted: { $ne: true } });
    if (!user) {
      return Response.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    if (user.locked_until && new Date() < user.locked_until) {
      const remaining = Math.ceil((user.locked_until.getTime() - Date.now()) / 60000);
      return Response.json(
        { error: `الحساب مقفل مؤقتًا، حاول بعد ${remaining} دقيقة` },
        { status: 423 }
      );
    }

    if (!user.is_active) {
      return Response.json({ error: "الحساب غير نشط" }, { status: 403 });
    }

    if (!verifyPassword(password, user.password_hash)) {
      const attempts = (user.failed_login_attempts || 0) + 1;
      const update: Record<string, unknown> = { failed_login_attempts: attempts };

      if (attempts >= 5) {
        update.locked_until = new Date(Date.now() + 30 * 60 * 1000);
      }

      await User.updateOne({ _id: user._id }, { $set: update });

      return Response.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    if (user.account_type === "sub_user" && user.owner_id) {
      const cascading = await checkCascadingExpiry(user._id.toString());
      if (cascading.blocked) {
        return Response.json({ error: cascading.reason || "تم تعليق حسابك" }, { status: 403 });
      }
    }

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          failed_login_attempts: 0,
          locked_until: null,
          last_login: new Date(),
        },
      }
    );

    await resetRateLimit(rateLimitKey);

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      type: "user",
      role: user.role,
      email: user.email,
      organization_id: user.organization_id?.toString() || undefined,
    });

    const refreshToken = signRefreshToken({
      sub: user._id.toString(),
      type: "user",
      email: user.email,
      organization_id: user.organization_id?.toString() || undefined,
    });

    const refreshTokenHash = hashToken(refreshToken);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await User.updateOne(
      { _id: user._id },
      {
        $push: {
          refresh_tokens: {
            $each: [{
              token_hash: refreshTokenHash,
              device_info: userAgent.slice(0, 200),
              ip,
              created_at: now,
              expires_at: expiresAt,
            }],
            $slice: -10,
          },
          sessions: {
            $each: [{
              id: crypto.randomUUID(),
              type: "web",
              device_info: userAgent.slice(0, 200),
              ip,
              login_at: now,
              last_active: now,
            }],
            $slice: -10,
          },
        },
      }
    );

    await setAuthCookies(accessToken, refreshToken);

    const activation = user.activation || {};
    const sub = activation.subscription || {};
    const status = activation.status || "trial";

    const warnings: string[] = [];
    if (!user.email_verified) {
      warnings.push("بريدك الإلكتروني غير مؤكّد. يرجى التحقق من بريدك لتفعيل الحساب.");
    }
    if (sub.end_date && new Date(sub.end_date) < now) {
      if (sub.grace_period_end && new Date(sub.grace_period_end) > now) {
        const remaining = Math.ceil((new Date(sub.grace_period_end).getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        warnings.push(`انتهت صلاحية اشتراكك، متبقي ${remaining} يوم سماح`);
      } else {
        warnings.push("انتهت صلاحية اشتراكك");
      }
    }
    if (status === "trial" && activation.trial_end && new Date(activation.trial_end) < now) {
      warnings.push("انتهت الفترة التجريبية");
    }
    if (status === "suspended") {
      warnings.push("حسابك معلق");
    }
    const warning = warnings.length > 0 ? warnings.join("\n") : null;

    let needsOnboarding = false;
    if (isMultiTenant() && user.account_type === "client") {
      if (!user.organization_id) {
        needsOnboarding = true;
      } else {
        const org = await Organization.findById(user.organization_id).select("settings").lean();
        needsOnboarding = !org?.settings || !(org.settings as Record<string, unknown>)?.company_name;
      }
    }

    await writeAuditLog({
      target_collection: "users",
      action: "login",
      target_id: user._id.toString(),
      target_username: user.username,
      performed_by: user.email,
      performed_by_type: "user",
      actor_role: toAuditRole(user.role),
      ip_address: ip,
      details: { needs_onboarding: needsOnboarding },
      success: true,
    });

    return Response.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        account_type: user.account_type || "client",
        serial_number: user.serial_number || null,
        activation: {
          status: user.activation?.status || "trial",
          trial_end: user.activation?.trial_end,
          subscription: {
            plan: user.activation?.subscription?.plan || "trial",
            end_date: user.activation?.subscription?.end_date,
          },
        },
        has_hardware_binding: !!user.hardware_hash,
        organization_id: user.organization_id?.toString() || null,
        email_verified: user.email_verified,
      },
      warning,
      needs_onboarding: needsOnboarding,
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "حدث خطأ أثناء تسجيل الدخول" }, { status: 500 });
  }
}
