import { NextRequest } from "next/server";
import crypto from "crypto";
import { requireOrganization, requireOrgAdmin } from "@/lib/organization";
import { connectDB } from "@/lib/mongodb";
import { Organization } from "@/models/Organization";
import { updateOrganizationSettingsSchema } from "@/lib/validation";

function maskSensitiveSettings(settings: Record<string, unknown>): Record<string, unknown> {
  const safe = { ...settings };
  if (typeof safe.bank_account === "string" && safe.bank_account.length > 4) {
    safe.bank_account = `****${safe.bank_account.slice(-4)}`;
  }
  if (typeof safe.vodafone_cash === "string" && safe.vodafone_cash.length > 4) {
    safe.vodafone_cash = `****${safe.vodafone_cash.slice(-4)}`;
  }
  return safe;
}

export async function GET(request: NextRequest) {
  const ctx = await requireOrganization(request);
  if (!ctx) return Response.json({ error: "غير مصرح" }, { status: 401 });

  if (!ctx.organization_id) {
    return Response.json({ settings: null });
  }

  try {
    await connectDB();
    const org = await Organization.findById(ctx.organization_id).select("settings settings_last_modified settings_content_hash").lean();
    if (!org) return Response.json({ settings: null });

    return Response.json({
      settings: maskSensitiveSettings(org.settings as Record<string, unknown>),
      last_modified: org.settings_last_modified,
      content_hash: org.settings_content_hash,
    });
  } catch (error) {
    console.error("Get org settings error:", error);
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

  const parsed = updateOrganizationSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    await connectDB();

    const now = new Date();
    const settingsUpdate: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) {
        settingsUpdate[`settings.${key}`] = value;
      }
    }
    settingsUpdate["settings_last_modified"] = now;

    const hashInput = JSON.stringify({ ...settingsUpdate, timestamp: now.toISOString() });
    const contentHash = crypto.createHash("sha256").update(hashInput).digest("hex");
    settingsUpdate["settings_content_hash"] = contentHash;

    const org = await Organization.findByIdAndUpdate(
      ctx.organization_id,
      { $set: { ...settingsUpdate, updated_at: now } },
      { new: true },
    ).lean();

    if (!org) return Response.json({ error: "المنظمة غير موجودة" }, { status: 404 });

    return Response.json({
      message: "تم تحديث الإعدادات",
      settings: maskSensitiveSettings(org.settings),
      last_modified: now,
      content_hash: contentHash,
    });
  } catch (error) {
    console.error("Update org settings error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
