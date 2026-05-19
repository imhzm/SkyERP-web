import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { requireAdminOrFounder } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { Organization, IOrganization } from "@/models/Organization";
import { User } from "@/models/User";
import {
  updateOrganizationSchema,
  updateSubscriptionSchema,
  updateOrganizationSettingsSchema,
} from "@/lib/validation";
import { writeAuditLog, toAuditRole } from "@/lib/audit";

// ── Types for populated .lean() results ──

interface PopulatedOwner {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  full_name: string;
  phone: string;
}

interface PopulatedAdminUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  full_name: string;
}

type PopulatedOrg = Omit<IOrganization, "owner_id" | "admins"> & {
  owner_id: PopulatedOwner | mongoose.Types.ObjectId | null;
  admins: Array<{
    user_id: PopulatedAdminUser | mongoose.Types.ObjectId;
    role: string;
    added_at: Date;
  }>;
};

// ── Helpers ──

function extractOwnerInfo(
  owner: PopulatedOwner | mongoose.Types.ObjectId | null | undefined,
): { id: string; username: string; email: string; full_name: string; phone: string } | null {
  if (!owner) return null;
  // .populate() guarantees a populated sub-document at runtime
  const p = owner as PopulatedOwner;
  return {
    id: p._id.toString(),
    username: p.username,
    email: p.email,
    full_name: p.full_name,
    phone: p.phone,
  };
}

function extractAdminInfo(
  admin: PopulatedOrg["admins"][number],
): { user_id: string; username: string; email: string; full_name: string; role: string; added_at: Date } {
  // .populate() guarantees user_id is populated at runtime
  const p = admin.user_id as PopulatedAdminUser;
  return {
    user_id: p._id.toString(),
    username: p.username,
    email: p.email,
    full_name: p.full_name,
    role: admin.role,
    added_at: admin.added_at,
  };
}

// ── GET ──

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;

  try {
    await connectDB();
    const doc = await Organization.findById(id)
      .populate("owner_id", "username email full_name phone")
      .populate("admins.user_id", "username email full_name")
      .lean();

    if (!doc) return Response.json({ error: "المنظمة غير موجودة" }, { status: 404 });

    const org = doc as unknown as PopulatedOrg;

    return Response.json({
      organization: {
        id: org._id.toString(),
        name: org.name,
        slug: org.slug,
        owner: extractOwnerInfo(org.owner_id),
        admins: (org.admins || []).map(extractAdminInfo),
        settings: org.settings,
        subscription: org.subscription,
        limits: org.limits,
        serial_number: org.serial_number,
        is_active: org.is_active,
        settings_last_modified: org.settings_last_modified,
        created_at: org.created_at,
        updated_at: org.updated_at,
      },
    });
  } catch (error) {
    console.error("Get organization detail error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// ── PATCH ──

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const bodyRecord = body as Record<string, unknown>;

  const parsed = updateOrganizationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    await connectDB();
    const org = await Organization.findById(id);
    if (!org) return Response.json({ error: "المنظمة غير موجودة" }, { status: 404 });

    const update: Record<string, unknown> = { updated_at: new Date() };
    if (parsed.data.name !== undefined) update.name = parsed.data.name;
    if (parsed.data.is_active !== undefined) update.is_active = parsed.data.is_active;
    if (parsed.data.limits !== undefined) update.limits = { ...org.limits, ...parsed.data.limits };

    const subscriptionData = bodyRecord?.subscription;
    if (subscriptionData) {
      const subParsed = updateSubscriptionSchema.safeParse(subscriptionData);
      if (subParsed.success) {
        Object.assign(update, {
          "subscription.plan": subParsed.data.plan,
          "subscription.auto_renew": subParsed.data.auto_renew,
        });
        if (subParsed.data.start_date) update["subscription.start_date"] = new Date(subParsed.data.start_date);
        if (subParsed.data.end_date !== undefined) update["subscription.end_date"] = subParsed.data.end_date ? new Date(subParsed.data.end_date) : null;

        if (subParsed.data.plan !== "trial" && subParsed.data.end_date) {
          update["subscription.status"] = "active";
          update["subscription.grace_period_end"] = new Date(new Date(subParsed.data.end_date).getTime() + 7 * 24 * 60 * 60 * 1000);
        } else if (subParsed.data.plan === "trial") {
          update["subscription.status"] = "trial";
        }
      }
    }

    const settingsData = bodyRecord?.settings;
    if (settingsData) {
      const settingsParsed = updateOrganizationSettingsSchema.safeParse(settingsData);
      if (settingsParsed.success) {
        for (const [key, value] of Object.entries(settingsParsed.data)) {
          if (value !== undefined) {
            update[`settings.${key}`] = value;
          }
        }
        update.settings_last_modified = new Date();
      }
    }

    await Organization.updateOne({ _id: id }, { $set: update });

    await writeAuditLog({
      target_collection: "organizations",
      action: "admin_update_organization",
      target_id: id,
      performed_by: payload.email || "admin",
      performed_by_type: "admin",
      actor_role: toAuditRole(payload.role),
      organization_id: payload.organization_id,
      details: parsed.data,
      success: true,
    });

    return Response.json({ message: "تم تحديث المنظمة" });
  } catch (error) {
    console.error("Update organization error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// ── DELETE ──

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;

  try {
    await connectDB();
    const org = await Organization.findById(id);
    if (!org) return Response.json({ error: "المنظمة غير موجودة" }, { status: 404 });

    await User.updateMany(
      { organization_id: org._id },
      { $set: { organization_id: null } },
    );

    await Organization.deleteOne({ _id: id });

    await writeAuditLog({
      target_collection: "organizations",
      action: "admin_delete_organization",
      target_id: id,
      performed_by: payload.email || "admin",
      performed_by_type: "admin",
      actor_role: toAuditRole(payload.role),
      organization_id: payload.organization_id,
      details: { name: org.name, slug: org.slug },
      success: true,
    });

    return Response.json({ message: "تم حذف المنظمة" });
  } catch (error) {
    console.error("Delete organization error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
