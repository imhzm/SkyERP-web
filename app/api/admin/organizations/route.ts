import { NextRequest } from "next/server";
import { requireAdminOrFounder } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { Organization } from "@/models/Organization";
import { User } from "@/models/User";
import { generateSerialNumber } from "@/models/SerialNumber";
import { createOrganizationSchema } from "@/lib/validation";
import { slugify } from "@/lib/organization";
import { DEFAULT_ORG_SETTINGS } from "@/lib/org-settings-defaults";
import { writeAuditLog, toAuditRole } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "ØºÙŠØ± Ù…ØµØ±Ø­" }, { status: 401 });

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search") || undefined;
  const status = url.searchParams.get("status") || "all";

  try {
    await connectDB();

    const filter: Record<string, any> = {};
    if (status === "active") filter.is_active = true;
    else if (status === "suspended" || status === "expired" || status === "trial") filter["subscription.status"] = status;
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: regex }, { slug: regex }, { serial_number: regex }];
    }

    const total = await Organization.countDocuments(filter);
    const orgs = await Organization.find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("owner_id", "username email full_name")
      .lean();

    return Response.json({
      organizations: orgs.map((o: any) => ({
        id: o._id.toString(),
        name: o.name,
        slug: o.slug,
        owner: o.owner_id ? {
          id: o.owner_id._id?.toString?.() || o.owner_id.toString(),
          username: o.owner_id.username || "",
          email: o.owner_id.email || "",
        } : null,
        subscription: o.subscription,
        limits: o.limits,
        serial_number: o.serial_number,
        is_active: o.is_active,
        admins_count: (o.admins || []).length,
        created_at: o.created_at,
        updated_at: o.updated_at,
      })),
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("List organizations error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "ØºÙŠØ± Ù…ØµØ±Ø­" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Ø¨ÙŠØ§Ù†Ø§Øª ØºÙŠØ± ØµØ§Ù„Ø­Ø©" }, { status: 400 }); }

  const parsed = createOrganizationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, slug: providedSlug, owner_user_id, company_name, company_phone, company_email } = parsed.data;

  try {
    await connectDB();

    const owner = await User.findById(owner_user_id);
    if (!owner) return Response.json({ error: "Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„Ù…Ø§Ù„Ùƒ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯" }, { status: 404 });

    const slug = providedSlug || slugify(name);
    const existingSlug = await Organization.findOne({ slug });
    if (existingSlug) return Response.json({ error: "Ø§Ù„Ø±Ø§Ø¨Ø· Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù…ÙˆØ¬ÙˆØ¯ Ø¨Ø§Ù„ÙØ¹Ù„" }, { status: 409 });

    const now = new Date();
    const serial = await generateSerialNumber();

    const org = await Organization.create({
      name,
      slug,
      owner_id: owner._id,
      admins: [{ user_id: owner._id, role: "owner" as const, added_at: now }],
      settings: {
        ...DEFAULT_ORG_SETTINGS,
        company_name: company_name || name,
        company_phone: company_phone || owner.phone || "",
        company_email: company_email || owner.email || "",
      },
      subscription: {
        plan: "trial",
        status: "trial",
        start_date: now,
        end_date: null,
        auto_renew: false,
        grace_period_end: null,
        trial_start: now,
        trial_end: null,
      },
      limits: { max_users: 1, max_devices: 1 },
      serial_number: serial,
      is_active: true,
      created_at: now,
      updated_at: now,
    });

    await User.updateOne({ _id: owner._id }, { $set: { organization_id: org._id } });

    await writeAuditLog({
      target_collection: "organizations",
      action: "admin_create_organization",
      target_id: org._id.toString(),
      performed_by: payload.email || "admin",
      performed_by_type: "admin",
      actor_role: toAuditRole(payload.role),
      organization_id: payload.organization_id,
      details: { name, slug, owner_id: owner_user_id },
      success: true,
    });

    return Response.json({
      message: "ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…Ù†Ø¸Ù…Ø© Ø¨Ù†Ø¬Ø§Ø­",
      organization: { id: org._id.toString(), name: org.name, slug: org.slug },
    }, { status: 201 });
  } catch (error) {
    console.error("Create organization error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£" }, { status: 500 });
  }
}
