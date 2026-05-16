import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { Plan } from "@/models/billing/Plan";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const planSchema = z.object({
  name: z.string().min(1),
  key: z.enum(["trial", "monthly", "half_yearly", "yearly", "lifetime"]),
  duration_days: z.number().int().positive(),
  price: z.number().min(0),
  currency: z.string().optional().default("EGP"),
  grace_period_days: z.number().int().min(0).optional().default(7),
  max_devices: z.number().int().positive().optional().default(1),
  features: z.array(z.string()).optional().default([]),
  sort_order: z.number().int().optional().default(0),
});

export async function GET(request: NextRequest) {
  const payload = requireAdmin(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  try {
    await connectDB();
    const plans = await Plan.find().sort({ sort_order: 1 }).lean();
    return Response.json({ plans });
  } catch (error) {
    console.error("Plans error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const payload = requireAdmin(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  try {
    await connectDB();
    const body = await request.json();
    const parsed = planSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "بيانات غير صحيحة", issues: parsed.error.issues }, { status: 400 });
    }

    const existing = await Plan.findOne({ key: parsed.data.key });
    if (existing) {
      return Response.json({ error: "الخطة موجودة بالفعل" }, { status: 409 });
    }

    const plan = await Plan.create(parsed.data);

    await writeAuditLog({
      target_collection: "plans",
      action: "admin_create_plan",
      target_id: plan._id.toString(),
      performed_by: payload.email || "admin",
      performed_by_type: "admin",
      ip_address: ip,
      success: true,
      details: { key: parsed.data.key, name: parsed.data.name, price: parsed.data.price },
    });

    return Response.json({ plan }, { status: 201 });
  } catch (error) {
    console.error("Create plan error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
