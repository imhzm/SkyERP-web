import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { User, IUser } from "@/models/User";
import { Organization } from "@/models/Organization";
import { generateSerialNumber } from "@/models/SerialNumber";
import { signAccessToken, signRefreshToken, hashToken } from "@/lib/auth";
import { exchangeCodeForTokens, getGoogleUserInfo, GoogleUserInfo } from "@/lib/google-auth";
import { isMultiTenant, slugify } from "@/lib/organization";
import { DEFAULT_ORG_SETTINGS } from "@/lib/org-settings-defaults";
import { writeAuditLog, toAuditRole } from "@/lib/audit";
import { checkCascadingExpiry } from "@/lib/subscription";
import { checkRateLimit } from "@/lib/rate-limit";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://erp.skywaveads.com";
const VALID_ORIGINS = ["login", "register"] as const;

function getValidatedOrigin(request: NextRequest): string {
  const raw = request.cookies.get("google_oauth_origin")?.value || "login";
  return VALID_ORIGINS.find(o => o === raw) ?? "login";
}

function clearOAuthCookies(res: NextResponse): NextResponse {
  res.cookies.delete("google_oauth_state");
  res.cookies.delete("google_oauth_origin");
  return res;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const savedState = request.cookies.get("google_oauth_state")?.value;
  const origin = getValidatedOrigin(request);

  if (error) {
    console.error("Google OAuth error:", error);
    return clearOAuthCookies(NextResponse.redirect(`${SITE_URL}/${origin}?error=google_auth_cancelled`));
  }

  if (!code || !state || state !== savedState) {
    return clearOAuthCookies(NextResponse.redirect(`${SITE_URL}/${origin}?error=google_auth_invalid`));
  }

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = await checkRateLimit(`google-callback:${ip}`, "auth:google-callback");
  if (!rl.allowed) {
    return clearOAuthCookies(NextResponse.redirect(`${SITE_URL}/${origin}?error=rate_limited`));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const googleUser: GoogleUserInfo = await getGoogleUserInfo(tokens.access_token);

    if (!googleUser.email || !googleUser.email_verified) {
      return clearOAuthCookies(NextResponse.redirect(`${SITE_URL}/${origin}?error=google_email_not_verified`));
    }

    await connectDB();

    const email = googleUser.email.toLowerCase();
    const existingUser = await User.findOne({ email, is_deleted: { $ne: true } });

    if (existingUser) {
      return await handleExistingUser(existingUser, googleUser.picture || null, request);
    }

    const softDeletedUser = await User.findOne({ email, is_deleted: true });
    if (softDeletedUser) {
      return await handleReactivatedUser(softDeletedUser, googleUser, request);
    }

    return await handleNewUser(googleUser, request);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return clearOAuthCookies(NextResponse.redirect(`${SITE_URL}/${origin}?error=google_auth_failed`));
  }
}

async function handleExistingUser(user: IUser, googlePictureUrl: string | null, request: NextRequest): Promise<NextResponse> {
  if (!user.is_active) {
    const origin = getValidatedOrigin(request);
    return clearOAuthCookies(NextResponse.redirect(`${SITE_URL}/${origin}?error=account_disabled`));
  }

  if (user.account_type === "sub_user" && user.owner_id) {
      const cascading = await checkCascadingExpiry(user._id.toString());
      if (cascading.blocked) {
        const origin = getValidatedOrigin(request);
        return clearOAuthCookies(NextResponse.redirect(`${SITE_URL}/${origin}?error=account_suspended`));
      }
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        email_verified: true,
        failed_login_attempts: 0,
        locked_until: null,
        last_login: new Date(),
        ...(user.profile_image_url ? {} : { profile_image_url: googlePictureUrl }),
      },
    },
  );

  const response = await createSessionAndRedirect(user, request, false);

  await writeAuditLog({
    target_collection: "users",
    action: "google_login",
    target_id: user._id.toString(),
    target_username: user.username,
    performed_by: user.email,
    performed_by_type: "user",
    actor_role: toAuditRole(user.role),
    ip_address: request.headers.get("x-forwarded-for") || "unknown",
    success: true,
  });

  return response;
}

async function handleNewUser(googleUser: GoogleUserInfo, request: NextRequest): Promise<NextResponse> {
  const email = googleUser.email.toLowerCase();
  const baseName = googleUser.name || googleUser.given_name || email.split("@")[0];
  const username = await generateUniqueUsername(baseName);
  const serial = await generateSerialNumber();
  const now = new Date();
  const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const user = await User.create({
    username,
    username_key: username.toLowerCase(),
    email,
    email_verified: true,
    email_verification_token: null,
    email_verification_sent_at: null,
    password_hash: `google_oauth:${crypto.randomUUID()}`,
    full_name: googleUser.name || username,
    phone: null,
    role: "client",
    account_type: "client",
    serial_number: serial,
    max_team_members: 0,
    is_active: true,
    profile_image_url: googleUser.picture || null,
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
        company_email: email,
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
    user.organization_id = org._id;
  }

  const response = await createSessionAndRedirect(user, request, true);

  await writeAuditLog({
    target_collection: "users",
    action: "google_register",
    target_id: user._id.toString(),
    target_username: username,
    performed_by: email,
    performed_by_type: "user",
    actor_role: "client",
    ip_address: request.headers.get("x-forwarded-for") || "unknown",
    details: { plan: "trial", trial_end: trialEnd.toISOString(), method: "google_oauth" },
    success: true,
  });

  return response;
}

async function handleReactivatedUser(user: IUser, googleUser: GoogleUserInfo, request: NextRequest): Promise<NextResponse> {
  if (!user.is_active) {
    const origin = getValidatedOrigin(request);
    return clearOAuthCookies(NextResponse.redirect(`${SITE_URL}/${origin}?error=account_disabled`));
  }

  const now = new Date();
  const pictureUrl = googleUser.picture || null;

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        is_deleted: false,
        email_verified: true,
        failed_login_attempts: 0,
        locked_until: null,
        last_login: now,
        full_name: googleUser.name || user.full_name,
        ...(user.profile_image_url ? {} : { profile_image_url: pictureUrl }),
      },
    },
  );

  const email = googleUser.email.toLowerCase();

  if (isMultiTenant() && !user.organization_id) {
    const orgSlug = slugify(user.username);
    const serial = user.serial_number || await generateSerialNumber();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const org = await Organization.create({
      name: user.username,
      slug: orgSlug,
      owner_id: user._id,
      admins: [{ user_id: user._id, role: "owner" as const, added_at: now }],
      settings: {
        ...DEFAULT_ORG_SETTINGS,
        company_name: "",
        company_email: email,
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
    user.organization_id = org._id;
    const response = await createSessionAndRedirect(user, request, true);
    await writeAuditLog({
      target_collection: "users",
      action: "google_reactivate",
      target_id: user._id.toString(),
      target_username: user.username,
      performed_by: email,
      performed_by_type: "user",
      actor_role: toAuditRole(user.role),
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      details: { method: "google_oauth", new_org: true },
      success: true,
    });
    return response;
  }

  const response = await createSessionAndRedirect(user, request, false);

  await writeAuditLog({
    target_collection: "users",
    action: "google_reactivate",
    target_id: user._id.toString(),
    target_username: user.username,
    performed_by: email,
    performed_by_type: "user",
    actor_role: toAuditRole(user.role),
    ip_address: request.headers.get("x-forwarded-for") || "unknown",
    details: { method: "google_oauth" },
    success: true,
  });

  return response;
}

async function createSessionAndRedirect(
  user: IUser,
  request: NextRequest,
  isNewUser: boolean,
): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "";

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
    },
  );

  const redirectPath = isNewUser
    ? "/onboarding"
    : await needsOnboardingRedirect(user);
  const response = NextResponse.redirect(`${SITE_URL}${redirectPath}`);

  response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60,
  });

  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60,
  });

  response.cookies.delete("google_oauth_state");
  response.cookies.delete("google_oauth_origin");

  return response;
}

async function needsOnboardingRedirect(user: IUser): Promise<string> {
  if (!isMultiTenant() || !user.organization_id) return "/dashboard";
  const org = await Organization.findById(user.organization_id).select("settings").lean();
  return org?.settings?.company_name ? "/dashboard" : "/onboarding";
}

async function generateUniqueUsername(base: string): Promise<string> {
  const cleaned = base
    .replace(/[^a-zA-Z0-9_\-]/g, "")
    .slice(0, 25);

  const candidate = cleaned || `user`;

  for (let attempt = 0; attempt < 20; attempt++) {
    const suffix = attempt === 0 ? "" : String(Math.floor(Math.random() * 9999) + 1);
    const username = candidate + suffix;

    const exists = await User.findOne({ username_key: username.toLowerCase() });
    if (!exists) return username;
  }

  return `u${Date.now().toString(36)}`;
}
