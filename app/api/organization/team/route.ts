import { NextRequest } from "next/server";
import { requireOrganization, requireOrgAdmin, isMultiTenant } from "@/lib/organization";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import { hashPassword } from "@/lib/auth";
import { createTeamSchema } from "@/lib/validation";
import { writeAuditLog, toAuditRole } from "@/lib/audit";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ctx = await requireOrganization(request);
  if (!ctx) return Response.json({ error: "ØºÙŠØ± Ù…ØµØ±Ø­" }, { status: 401 });

  try {
    await connectDB();

    if (isMultiTenant() && ctx.organization_id && ctx._orgDoc) {
      const org = ctx._orgDoc;
      const memberIds = org.admins?.map((a: any) => a.user_id) || [];
      const members = await User.find({
        _id: { $in: memberIds },
        is_deleted: { $ne: true },
      }).select("username email full_name is_active created_at last_login").lean();

      return Response.json({
        team: members.map((m: any) => ({
          id: m._id.toString(),
          username: m.username,
          email: m.email,
          full_name: m.full_name,
          is_active: m.is_active,
          created_at: m.created_at,
          last_login: m.last_login,
        })),
        limits: org.limits,
      });
    }

    return Response.json({ team: [], limits: null });
  } catch (error) {
    console.error("Get org team error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ctx = await requireOrgAdmin(request);
  if (!ctx) return Response.json({ error: "غير مصرح" }, { status: 401 });

  if (!ctx.organization_id) {
    return Response.json({ error: "لا توجد منظمة مرتبطة" }, { status: 400 });
  }

  const rl = await checkRateLimit(`org-team-create:${ctx.organization_id}`, "api:org-team-create");
  if (!rl.allowed) return getRateLimitResponse(rl.resetIn);

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Ø¨ÙŠØ§Ù†Ø§Øª ØºÙŠØ± ØµØ§Ù„Ø­Ø©" }, { status: 400 }); }

  const parsed = createTeamSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { username, email, phone, password, full_name } = parsed.data;

  try {
    await connectDB();

    const existing = await User.findOne({
      $or: [{ username_key: username.toLowerCase() }, { email: email.toLowerCase() }],
    });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? "email" : "username";
      return Response.json(
        { error: field === "email" ? "Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ø§Ù„ÙØ¹Ù„" : "Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ø§Ù„ÙØ¹Ù„" },
        { status: 409 },
      );
    }

    const org = await Organization.findById(ctx.organization_id);
    if (!org) return Response.json({ error: "Ø§Ù„Ù…Ù†Ø¸Ù…Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©" }, { status: 404 });

    const currentAdminCount = (org.admins || []).length;
    if (org.limits?.max_users && currentAdminCount >= org.limits.max_users) {
      return Response.json({ error: "Ù„Ù‚Ø¯ ÙˆØµÙ„Øª Ù„Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ Ù…Ù† Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†" }, { status: 400 });
    }

    const now = new Date();
    const newUser = await User.create({
      username,
      username_key: username.toLowerCase(),
      email: email.toLowerCase(),
      email_verified: false,
      password_hash: hashPassword(password),
      full_name,
      phone: phone || null,
      role: "sub_user",
      account_type: "sub_user",
      owner_id: org.owner_id,
      organization_id: org._id,
      is_active: true,
      activation: {
        status: org.subscription?.status || "trial",
        max_devices: 1,
        subscription: {
          plan: org.subscription?.plan || "trial",
          start_date: now,
          end_date: org.subscription?.end_date || null,
          auto_renew: false,
          grace_period_end: org.subscription?.grace_period_end || null,
        },
      },
      created_at: now,
      last_modified: now,
      sync_status: "synced",
    });

    await Organization.updateOne(
      { _id: org._id },
      { $push: { admins: { user_id: newUser._id, role: "admin", added_at: now } } },
    );

    await writeAuditLog({
      target_collection: "users",
      action: "org_create_team_member",
      target_id: newUser._id.toString(),
      performed_by: ctx.payload.email || ctx.payload.sub,
      performed_by_type: "user",
      actor_role: toAuditRole(ctx.payload.role),
      organization_id: ctx.organization_id,
      details: { username, email, org_id: ctx.organization_id },
      success: true,
    });

    return Response.json({
      message: "ØªÙ… Ø¥Ø¶Ø§ÙØ© Ø¹Ø¶Ùˆ Ø§Ù„ÙØ±ÙŠÙ‚ Ø¨Ù†Ø¬Ø§Ø­",
      member: {
        id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Create org team member error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£" }, { status: 500 });
  }
}
