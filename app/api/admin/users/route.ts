import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { requireAdminOrFounder } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import { generateSerialNumber } from "@/models/SerialNumber";
import { hashPassword } from "@/lib/auth";
import { createUserSchema, paginationSchema } from "@/lib/validation";
import { writeAuditLog, toAuditRole } from "@/lib/audit";
import { isMultiTenant, slugify } from "@/lib/organization";
import { DEFAULT_ORG_SETTINGS } from "@/lib/org-settings-defaults";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "ØºÙŠØ± Ù…ØµØ±Ø­" }, { status: 401 });

  const url = new URL(request.url);
  const params = {
    page: url.searchParams.get("page") || "1",
    limit: url.searchParams.get("limit") || "20",
    search: url.searchParams.get("search") || undefined,
    status: url.searchParams.get("status") || "all",
    account_type: url.searchParams.get("account_type") || "all",
    role: url.searchParams.get("role") || "all",
    sort_by: url.searchParams.get("sort_by") || "created_at",
    sort_order: url.searchParams.get("sort_order") || "desc",
  };

  const parsed = paginationSchema.safeParse(params);
  if (!parsed.success) {
    return Response.json({ error: "Ù…Ø¹Ø§Ù…Ù„Ø§Øª ØºÙŠØ± ØµØ§Ù„Ø­Ø©" }, { status: 400 });
  }

  const { page, limit, search, status, account_type, role, sort_by, sort_order } = parsed.data;

  try {
    await connectDB();

    const filter: Record<string, any> = { is_deleted: { $ne: true } };

    if (status !== "all") {
      if (status === "active") filter["activation.status"] = "active";
      else if (status === "suspended") filter["activation.status"] = "suspended";
      else if (status === "expired") {
        filter["activation.status"] = { $in: ["expired", "trial"] };
      } else if (status === "trial") filter["activation.status"] = "trial";
    }

    if (account_type !== "all") {
      filter.account_type = account_type;
    }

    if (role !== "all") {
      filter.role = role;
    }

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { username: regex },
        { email: regex },
        { full_name: regex },
      ];
    }

    const sort: Record<string, 1 | -1> = {};
    sort[sort_by] = sort_order === "asc" ? 1 : -1;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password_hash -refresh_tokens -audit_log")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const mapped = users.map((u: any) => ({
      id: u._id.toString(),
      username: u.username,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      account_type: u.account_type || "client",
      owner_id: u.owner_id?.toString() || null,
      serial_number: u.serial_number || null,
      team_members: (u.team_members || []).length,
      max_team_members: u.max_team_members || 0,
      company_name: u.company_name || null,
      tags: u.tags || [],
      is_active: u.is_active,
      activation_status: u.activation?.status || "trial",
      subscription_plan: u.activation?.subscription?.plan || "trial",
      subscription_end: u.activation?.subscription?.end_date,
      trial_end: u.activation?.trial_end,
      has_hardware_binding: !!u.hardware_hash,
      hardware_first_login: u.hardware_first_login,
      desktop_role: u.desktop_role || null,
      last_login: u.last_login,
      created_at: u.created_at,
      phone: u.phone,
      email_verified: u.email_verified,
      organization_id: u.organization_id?.toString() || null,
    }));

    return Response.json({
      users: mapped,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin list users error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = await checkRateLimit(`admin-create-user:${ip}`, "api:admin-mutate");
  if (!rl.allowed) return getRateLimitResponse(rl.resetIn);

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Ø¨ÙŠØ§Ù†Ø§Øª ØºÙŠØ± ØµØ§Ù„Ø­Ø©" }, { status: 400 }); }

  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return Response.json({ error: firstError.message, field: firstError.path[0] }, { status: 400 });
  }

  const { username, email, phone, password, full_name, role, account_type, owner_id, plan, subscription_days, max_team_members, company_name, notes, tags, desktop_role } = parsed.data;

  try {
    await connectDB();

    const existing = await User.findOne({
      $or: [
        { username_key: username.toLowerCase() },
        { email: email.toLowerCase() },
      ],
    });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? "email" : "username";
      return Response.json(
        { error: field === "email" ? "Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ø§Ù„ÙØ¹Ù„" : "Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ø§Ù„ÙØ¹Ù„" },
        { status: 409 }
      );
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + subscription_days * 24 * 60 * 60 * 1000);
    const effectiveAccountType = account_type || (role === "sub_user" ? "sub_user" : "client");
    const serial = effectiveAccountType === "client" ? await generateSerialNumber() : null;
    const effectiveMaxTeam = effectiveAccountType === "client" ? (max_team_members || 0) : 0;

    let resolvedOrganizationId: mongoose.Types.ObjectId | null = null;
    if (isMultiTenant()) {
      if (effectiveAccountType === "sub_user" && owner_id) {
        const owner = await User.findById(owner_id);
        resolvedOrganizationId = owner?.organization_id || null;
      } else if (effectiveAccountType === "client") {
        resolvedOrganizationId = null;
      }
    }

    const user = await User.create({
      username,
      username_key: username.toLowerCase(),
      email: email.toLowerCase(),
      email_verified: true,
      password_hash: hashPassword(password),
      full_name,
      phone: phone || null,
      role: effectiveAccountType === "sub_user" ? "sub_user" : "client",
      account_type: effectiveAccountType,
      owner_id: owner_id || null,
      serial_number: serial,
      max_team_members: effectiveMaxTeam,
      company_name: company_name || null,
      notes: notes || "",
      tags: tags || [],
      created_by_admin_id: payload.sub ? new mongoose.Types.ObjectId(payload.sub) : null,
      is_active: true,
      activation: {
        status: effectiveAccountType === "sub_user" ? "active" : "active",
        max_devices: 1,
        subscription: {
          plan,
          start_date: now,
          end_date: endDate,
          auto_renew: false,
          grace_period_end: new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      desktop_role: desktop_role || null,
      organization_id: resolvedOrganizationId,
      created_at: now,
      last_modified: now,
      sync_status: "synced",
    });

    if (isMultiTenant() && effectiveAccountType === "client") {
      const orgSlug = slugify(company_name || username);
      const org = await Organization.create({
        name: company_name || username,
        slug: orgSlug,
        owner_id: user._id,
        admins: [{ user_id: user._id, role: "owner" as const, added_at: now }],
        settings: {
          ...DEFAULT_ORG_SETTINGS,
          company_name: company_name || username,
          company_phone: phone || "",
          company_email: email.toLowerCase(),
        },
        subscription: {
          plan,
          status: "active",
          start_date: now,
          end_date: endDate,
          auto_renew: false,
          grace_period_end: new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000),
          trial_start: null,
          trial_end: null,
        },
        limits: { max_users: (max_team_members || 0) + 1, max_devices: 1 },
        serial_number: serial,
        is_active: true,
        created_at: now,
        updated_at: now,
      });
      await User.updateOne({ _id: user._id }, { $set: { organization_id: org._id } });
    }

    await writeAuditLog({
      target_collection: "users",
      action: "admin_create_user",
      target_id: user._id.toString(),
      target_username: username,
      performed_by: payload.email,
      performed_by_type: "admin",
      actor_role: toAuditRole(payload.role),
      organization_id: payload.organization_id,
      details: { role, account_type, plan, subscription_days, serial_number: serial },
      success: true,
    });

    return Response.json({
      message: "ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ù†Ø¬Ø§Ø­",
      user: { id: user._id.toString(), username: user.username, email: user.email, role: user.role },
    }, { status: 201 });
  } catch (error) {
    console.error("Admin create user error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…" }, { status: 500 });
  }
}
