import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { requireAdminOrFounder } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Invoice } from "@/models/billing/Invoice";
import { Transaction } from "@/models/billing/Transaction";
import { AuditLog } from "@/models/AuditLog";
import { updateUserSchema } from "@/lib/validation";
import { writeAuditLog, toAuditRole } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "ØºÙŠØ± Ù ØµØ±Ø­" }, { status: 401 });

  const { id } = await params;

  try {
    await connectDB();
    const user = await User.findById(id).select("-password_hash -refresh_tokens");
    if (!user || user.is_deleted) {
      return Response.json({ error: "Ø§ÙÙ Ø³ØªØ®Ø¯Ù ØºÙŠØ± Ù ÙÙØ¬ÙØ¯" }, { status: 404 });
    }

    return Response.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        account_type: user.account_type || "client",
        owner_id: user.owner_id?.toString() || null,
        serial_number: user.serial_number || null,
        team_members: user.team_members || [],
        max_team_members: user.max_team_members || 0,
        company_name: user.company_name || null,
        notes: user.notes || "",
        tags: user.tags || [],
        created_by_admin_id: user.created_by_admin_id?.toString() || null,
        is_active: user.is_active,
        email_verified: user.email_verified,
        hardware_first_login: user.hardware_first_login,
        activation: user.activation,
        failed_login_attempts: user.failed_login_attempts,
        locked_until: user.locked_until,
        created_at: user.created_at,
        last_login: user.last_login,
        last_modified: user.last_modified,
        linked_employee_id: user.linked_employee_id,
        linked_employee_code: user.linked_employee_code,
        desktop_role: user.desktop_role || null,
      },
    });
  } catch (error) {
    console.error("Admin get user error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "ØºÙŠØ± Ù ØµØ±Ø­" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Ø¨ÙØ§ÙØ§Øª ØºÙŠØ± ØµØ§ÙØØ©" }, { status: 400 }); }

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await User.findById(id);
    if (!user || user.is_deleted) {
      return Response.json({ error: "Ø§ÙÙ Ø³ØªØ®Ø¯Ù ØºÙŠØ± Ù ÙÙØ¬ÙØ¯" }, { status: 404 });
    }

    const { activation_status, ...fields } = parsed.data;
    const update: Record<string, any> = { last_modified: new Date() };

    if (fields.full_name !== undefined) update.full_name = fields.full_name;
    if (fields.phone !== undefined) update.phone = fields.phone || null;
    if (fields.role !== undefined) update.role = fields.role;
    if (fields.account_type !== undefined) update.account_type = fields.account_type;
    if (fields.is_active !== undefined) update.is_active = fields.is_active;
    if (fields.notes !== undefined) update.notes = fields.notes;
    if (fields.tags !== undefined) update.tags = fields.tags;
    if (fields.company_name !== undefined) update.company_name = fields.company_name;
    if (fields.max_team_members !== undefined) update.max_team_members = fields.max_team_members;
    if (fields.desktop_role !== undefined) update.desktop_role = fields.desktop_role || null;
    if (fields.custom_permissions !== undefined) update.custom_permissions = fields.custom_permissions;

    if (activation_status) {
      update["activation.status"] = activation_status;
    }

    await User.updateOne({ _id: id }, { $set: update });

    await writeAuditLog({
      target_collection: "users",
      action: "admin_update_user",
      target_id: id,
      target_username: user.username,
      performed_by: payload.email,
      performed_by_type: "admin",
      actor_role: toAuditRole(payload.role),
      organization_id: payload.organization_id,
      details: { changes: parsed.data },
      success: true,
    });

    return Response.json({ message: "ØªÙ ØªØ­Ø¯ÙŠØ« Ø§ÙÙ Ø³ØªØ®Ø¯Ù Ø¨ÙØ¬Ø§Ø" });
  } catch (error) {
    console.error("Admin update user error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "ØºÙŠØ± Ù ØµØ±Ø­" }, { status: 401 });

  const { id } = await params;

  try {
    await connectDB();
    const user = await User.findById(id);
    if (!user || user.is_deleted) {
      return Response.json({ error: "Ø§ÙÙ Ø³ØªØ®Ø¯Ù ØºÙŠØ± Ù ÙÙØ¬ÙØ¯" }, { status: 404 });
    }

    const userId = user._id;
    const now = new Date();

    const subUsers = await User.find({ owner_id: userId, is_deleted: { $ne: true } });
    const subUserIds = subUsers.map((u) => u._id);
    if (subUserIds.length > 0) {
      await User.updateMany(
        { _id: { $in: subUserIds } },
        { $set: { is_deleted: true, is_active: false, last_modified: now } }
      );
      await Invoice.updateMany(
        { user_id: { $in: subUserIds } },
        { $set: { status: "cancelled", notes: "ØªÙ Ø­Ø°Ù Ø§ÙÙ Ø³ØªØ®Ø¯Ù " } }
      );
      await Transaction.updateMany(
        { user_id: { $in: subUserIds } },
        { $set: { status: "cancelled", notes: "ØªÙ Ø­Ø°Ù Ø§ÙÙ Ø³ØªØ®Ø¯Ù " } }
      );
    }

    if (user.owner_id) {
      await User.updateOne(
        { _id: user.owner_id },
        { $pull: { team_members: userId } }
      );
    }

    await User.updateMany(
      { team_members: userId },
      { $pull: { team_members: userId } }
    );

    await Invoice.updateMany(
      { user_id: userId },
      { $set: { status: "cancelled", notes: "ØªÙ Ø­Ø°Ù Ø§ÙÙ Ø³ØªØ®Ø¯Ù " } }
    );

    await Transaction.updateMany(
      { user_id: userId },
      { $set: { status: "cancelled", notes: "ØªÙ Ø­Ø°Ù Ø§ÙÙ Ø³ØªØ®Ø¯Ù " } }
    );

    await AuditLog.deleteMany({ target_id: id });

    await User.deleteOne({ _id: userId });

    await writeAuditLog({
      target_collection: "users",
      action: "admin_delete_user",
      target_id: id,
      target_username: user.username,
      performed_by: payload.email,
      performed_by_type: "admin",
      actor_role: toAuditRole(payload.role),
      organization_id: payload.organization_id,
      details: {
        hard_delete: true,
        deleted_sub_accounts: subUserIds.length,
        deleted_invoices: true,
        deleted_transactions: true,
      },
      success: true,
    });

    return Response.json({
      message: "ØªÙ Ø­Ø°Ù Ø§ÙÙ Ø³ØªØ®Ø¯Ù ÙÙØ§Ø¦ÙØ§Ù Ù Ø¹ ÙÙ Ø§ÙØ¨ÙØ§ÙØ§Øª Ø§ÙÙ Ø±ØªØ¨Ø·Ø© Ø¨Ù",
      deleted_sub_accounts: subUserIds.length,
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«ÙØ§Ø¡ Ø­Ø°Ù Ø§ÙÙ Ø³ØªØ®Ø¯Ù " }, { status: 500 });
  }
}
