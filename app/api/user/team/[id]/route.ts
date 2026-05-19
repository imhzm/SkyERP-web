import { NextRequest } from "next/server";
import { getTokenFromRequest } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { updateTeamSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";
import { isMultiTenant } from "@/lib/organization";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.type !== "user") {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { id } = await params;

  try {
    await connectDB();
    const owner = await User.findById(payload.sub);
    if (!owner || owner.is_deleted) {
      return Response.json({ error: "غير موجود" }, { status: 404 });
    }

    if (owner.account_type !== "client") {
      return Response.json({ error: "غير مصرح" }, { status: 403 });
    }

    const member = await User.findById(id);
    if (!member || member.is_deleted) {
      return Response.json({ error: "عضو الفريق غير موجود" }, { status: 404 });
    }

    if (member.owner_id?.toString() !== owner._id.toString()) {
      return Response.json({ error: "هذا المستخدم ليس من فريقك" }, { status: 403 });
    }

    if (isMultiTenant() && owner.organization_id && member.organization_id?.toString() !== owner.organization_id.toString()) {
      return Response.json({ error: "هذا المستخدم ليس من منظمتك" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateTeamSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const update: Record<string, unknown> = { last_modified: new Date() };
    if (parsed.data.full_name !== undefined) update.full_name = parsed.data.full_name;
    if (parsed.data.phone !== undefined) update.phone = parsed.data.phone || null;
    if (parsed.data.is_active !== undefined) update.is_active = parsed.data.is_active;

    await User.updateOne({ _id: id }, { $set: update });

    return Response.json({ message: "تم تحديث عضو الفريق بنجاح" });
  } catch (error) {
    console.error("Team update error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.type !== "user") {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { id } = await params;

  try {
    await connectDB();
    const owner = await User.findById(payload.sub);
    if (!owner || owner.is_deleted) {
      return Response.json({ error: "غير موجود" }, { status: 404 });
    }

    if (owner.account_type !== "client") {
      return Response.json({ error: "غير مصرح" }, { status: 403 });
    }

    const member = await User.findById(id);
    if (!member || member.is_deleted) {
      return Response.json({ error: "عضو الفريق غير موجود" }, { status: 404 });
    }

    if (member.owner_id?.toString() !== owner._id.toString()) {
      return Response.json({ error: "هذا المستخدم ليس من فريقك" }, { status: 403 });
    }

    if (isMultiTenant() && owner.organization_id && member.organization_id?.toString() !== owner.organization_id.toString()) {
      return Response.json({ error: "هذا المستخدم ليس من منظمتك" }, { status: 403 });
    }

    await User.updateOne(
      { _id: id },
      { $set: { is_deleted: true, is_active: false, last_modified: new Date() } }
    );

    await User.updateOne(
      { _id: owner._id },
      { $pull: { team_members: member._id } }
    );

    return Response.json({ message: "تم حذف عضو الفريق بنجاح" });
  } catch (error) {
    console.error("Team delete error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
