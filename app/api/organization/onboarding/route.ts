import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Organization } from "@/models/Organization";
import { requireOrgAdmin } from "@/lib/organization";
import { writeAuditLog, toAuditRole } from "@/lib/audit";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

const onboardingSchema = z.object({
  company_name: z.string().min(2, "اسم الشركة مطلوب").max(100),
  company_tagline: z.string().max(200).optional().default(""),
  company_address: z.string().max(300).optional().default(""),
  company_phone: z.string().max(30).optional().default(""),
  company_email: z.string().email().optional().or(z.literal("")),
  company_logo_data: z.string().max(2_000_000).optional().default(""),
  bank_name: z.string().max(100).optional().default(""),
  bank_account: z.string().max(50).optional().default(""),
  vodafone_cash: z.string().max(30).optional().default(""),
  default_tax_rate: z.number().min(0).max(100).optional().default(0),
  hr_payroll_days_divisor: z.number().min(1).max(31).optional().default(30),
  hr_standard_work_hours_per_day: z.number().min(1).max(24).optional().default(8),
  hr_overtime_rate_multiplier: z.number().min(1).max(5).optional().default(1.25),
  hr_workday_start_time: z.string().regex(/^\d{2}:\d{2}$/).optional().default("09:00"),
  hr_workday_end_time: z.string().regex(/^\d{2}:\d{2}$/).optional().default("17:00"),
  hr_late_grace_minutes: z.number().int().min(0).max(120).optional().default(15),
  hr_early_leave_grace_minutes: z.number().int().min(0).max(120).optional().default(15),
  hr_weekend_days: z.array(z.number().int().min(0).max(6)).optional().default([4, 5]),
  hr_missing_attendance_counts_as_absence: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = await checkRateLimit(`onboarding:${ip}`, "api:default");
  if (!rl.allowed) {
    return getRateLimitResponse(rl.resetIn);
  }

  const ctx = await requireOrgAdmin(request);
  if (!ctx) return Response.json({ error: "غير مصرح" }, { status: 401 });

  if (!ctx.organization_id) {
    return Response.json({ error: "لا توجد منظمة مرتبطة" }, { status: 400 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "بيانات غير صالحة" }, { status: 400 }); }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return Response.json({ error: firstError.message }, { status: 400 });
  }

  try {
    await connectDB();

    const existing = await Organization.findById(ctx.organization_id).select("settings").lean();
    if (existing?.settings?.company_name) {
      return Response.json({ error: "تم إعداد المنظمة مسبقاً" }, { status: 409 });
    }

    const settingsUpdate: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      settingsUpdate[`settings.${key}`] = value;
    }

    const org = await Organization.findByIdAndUpdate(
      ctx.organization_id,
      {
        $set: {
          ...settingsUpdate,
          name: parsed.data.company_name,
          updated_at: new Date(),
        },
      },
      { new: true },
    ).lean();

    if (!org) return Response.json({ error: "المنظمة غير موجودة" }, { status: 404 });

    await writeAuditLog({
      target_collection: "organizations",
      action: "onboarding_complete",
      target_id: ctx.organization_id,
      performed_by: ctx.payload.email || ctx.payload.sub,
      performed_by_type: "user",
      actor_role: toAuditRole(ctx.payload.role),
      organization_id: ctx.organization_id,
      ip_address: ip,
      details: { company_name: parsed.data.company_name },
      success: true,
    });

    return Response.json({
      message: "تم إعداد المنظمة بنجاح",
      organization: {
        id: org._id.toString(),
        name: org.name,
      },
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
