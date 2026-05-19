import { NextRequest } from "next/server";
import { requireOrganization, requireOrgAdmin } from "@/lib/organization";
import { connectDB } from "@/lib/mongodb";
import { Organization } from "@/models/Organization";
import { updateOrganizationSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const ctx = await requireOrganization(request);
  if (!ctx) return Response.json({ error: "غير مصرح" }, { status: 401 });

  if (!ctx.organization_id) {
    return Response.json({ organization: null });
  }

  try {
    await connectDB();
    const org = await Organization.findById(ctx.organization_id).lean();
    if (!org) return Response.json({ organization: null });

    return Response.json({
      organization: {
        id: org._id.toString(),
        name: org.name,
        slug: org.slug,
        owner_id: org.owner_id.toString(),
        admins: (org.admins || []).map((a: any) => ({
          user_id: a.user_id.toString(),
          role: a.role,
          added_at: a.added_at,
        })),
        limits: org.limits,
        serial_number: org.serial_number,
        is_active: org.is_active,
        created_at: org.created_at,
        updated_at: org.updated_at,
      },
    });
  } catch (error) {
    console.error("Get organization error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const ctx = await requireOrgAdmin(request);
  if (!ctx) return Response.json({ error: "غير مصرح" }, { status: 401 });

  if (!ctx.organization_id) {
    return Response.json({ error: "لا توجد منظمة مرتبطة" }, { status: 400 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "بيانات غير صالحة" }, { status: 400 }); }

  const parsed = updateOrganizationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    await connectDB();
    const org = await Organization.findById(ctx.organization_id);
    if (!org) return Response.json({ error: "المنظمة غير موجودة" }, { status: 404 });

    const update: Record<string, any> = { updated_at: new Date() };
    if (parsed.data.name !== undefined) update.name = parsed.data.name;
    if (parsed.data.is_active !== undefined) update.is_active = parsed.data.is_active;
    if (parsed.data.limits !== undefined) update.limits = { ...org.limits, ...parsed.data.limits };

    const updated = await Organization.findByIdAndUpdate(
      ctx.organization_id,
      { $set: update },
      { new: true },
    ).lean();

    if (!updated) return Response.json({ error: "المنظمة غير موجودة" }, { status: 404 });

    return Response.json({
      message: "تم تحديث المنظمة",
      organization: {
        id: updated._id.toString(),
        name: updated.name,
        slug: updated.slug,
        limits: updated.limits,
        is_active: updated.is_active,
      },
    });
  } catch (error) {
    console.error("Update organization error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
