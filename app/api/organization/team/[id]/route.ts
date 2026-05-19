import { NextRequest } from "next/server";
import { requireOrgAdmin } from "@/lib/organization";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import { updateTeamSchema } from "@/lib/validation";
import { writeAuditLog, toAuditRole } from "@/lib/audit";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await requireOrgAdmin(request);
  if (!ctx) return Response.json({ error: "ØºÙŠØ± Ù…ØµØ±Ø­" }, { status: 401 });

  if (!ctx.organization_id) {
    return Response.json({ error: "Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù†Ø¸Ù…Ø© Ù…Ø±ØªØ¨Ø·Ø©" }, { status: 400 });
  }

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Ø¨ÙŠØ§Ù†Ø§Øª ØºÙŠØ± ØµØ§Ù„Ø­Ø©" }, { status: 400 }); }

  const parsed = updateTeamSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    await connectDB();

    const org = await Organization.findById(ctx.organization_id);
    if (!org) return Response.json({ error: "المنظمة غير موجودة" }, { status: 404 });

    if (org.owner_id.toString() === id) {
      return Response.json({ error: "لا يمكن تعديل مالك المنظمة" }, { status: 403 });
    }

    const member = await User.findOne({ _id: id, organization_id: ctx.organization_id, is_deleted: { $ne: true } });
    if (!member) return Response.json({ error: "العضو غير موجود" }, { status: 404 });

    const update: Record<string, any> = { last_modified: new Date() };
    if (parsed.data.full_name !== undefined) update.full_name = parsed.data.full_name;
    if (parsed.data.phone !== undefined) update.phone = parsed.data.phone || null;
    if (parsed.data.is_active !== undefined) update.is_active = parsed.data.is_active;

    await User.updateOne({ _id: id, organization_id: ctx.organization_id }, { $set: update });

    return Response.json({ message: "ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¹Ø¶Ùˆ" });
  } catch (error) {
    console.error("Update org team member error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await requireOrgAdmin(request);
  if (!ctx) return Response.json({ error: "ØºÙŠØ± Ù…ØµØ±Ø­" }, { status: 401 });

  if (!ctx.organization_id) {
    return Response.json({ error: "Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù†Ø¸Ù…Ø© Ù…Ø±ØªØ¨Ø·Ø©" }, { status: 400 });
  }

  const { id } = await params;

  try {
    await connectDB();

    if (id === ctx.payload.sub) {
      return Response.json({ error: "لا يمكنك حذف نفسك" }, { status: 400 });
    }

    const org = await Organization.findById(ctx.organization_id);
    if (org && org.owner_id.toString() === id) {
      return Response.json({ error: "لا يمكن حذف مالك المنظمة" }, { status: 403 });
    }

    const member = await User.findOne({ _id: id, organization_id: ctx.organization_id, is_deleted: { $ne: true } });
    if (!member) return Response.json({ error: "العضو غير موجود" }, { status: 404 });

    await User.updateOne({ _id: id, organization_id: ctx.organization_id }, { $set: { is_deleted: true, is_active: false } });
    await Organization.updateOne(
      { _id: ctx.organization_id },
      { $pull: { admins: { user_id: id } } },
    );

    await writeAuditLog({
      target_collection: "users",
      action: "org_delete_team_member",
      target_id: id,
      performed_by: ctx.payload.email || ctx.payload.sub,
      performed_by_type: "user",
      actor_role: toAuditRole(ctx.payload.role),
      organization_id: ctx.organization_id,
      details: { org_id: ctx.organization_id },
      success: true,
    });

    return Response.json({ message: "ØªÙ… Ø­Ø°Ù Ø§Ù„Ø¹Ø¶Ùˆ" });
  } catch (error) {
    console.error("Delete org team member error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£" }, { status: 500 });
  }
}
