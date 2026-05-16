import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { Plan } from "@/models/billing/Plan";
import { writeAuditLog } from "@/lib/audit";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  duration_days: z.number().int().positive().optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  grace_period_days: z.number().int().min(0).optional(),
  max_devices: z.number().int().positive().optional(),
  features: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const payload = requireAdmin(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const { key } = await params;

  try {
    await connectDB();
    const plan = await Plan.findOne({ key }).lean();
    if (!plan) return Response.json({ error: "الخطة غير موجودة" }, { status: 404 });
    return Response.json({ plan });
  } catch (error) {
    console.error("Plan detail error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const payload = requireAdmin(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { key } = await params;

  try {
    await connectDB();
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "بيانات غير صحيحة", issues: parsed.error.issues }, { status: 400 });
    }

    const plan = await Plan.findOneAndUpdate({ key }, { $set: { ...parsed.data, updated_at: new Date() } }, { new: true });
    if (!plan) return Response.json({ error: "الخطة غير موجودة" }, { status: 404 });

    await writeAuditLog({
      target_collection: "plans",
      action: "admin_update_plan",
      target_id: plan._id.toString(),
      performed_by: payload.email || "admin",
      performed_by_type: "admin",
      ip_address: ip,
      success: true,
      details: { key, changes: Object.keys(parsed.data) },
    });

    return Response.json({ plan });
  } catch (error) {
    console.error("Plan update error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
