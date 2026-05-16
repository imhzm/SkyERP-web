import { NextRequest } from "next/server";
import { requireAdminOrFounder } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { AuditLog } from "@/models/AuditLog";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  action: z.string().optional(),
  target_collection: z.string().optional(),
  performed_by: z.string().optional(),
  success: z.coerce.boolean().optional(),
  search: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return Response.json({ error: "معاملات غير صحيحة" }, { status: 400 });
    }

    const { page, limit, action, target_collection, performed_by, success, search, start_date, end_date } = parsed.data;

    const filter: Record<string, any> = {};
    if (action) filter.action = action;
    if (target_collection) filter.target_collection = target_collection;
    if (performed_by) filter.performed_by = { $regex: performed_by, $options: "i" };
    if (success !== undefined) filter.success = success;
    if (search) {
      filter.$or = [
        { performed_by: { $regex: search, $options: "i" } },
        { target_username: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
        { ip_address: { $regex: search, $options: "i" } },
      ];
    }
    if (start_date || end_date) {
      filter.timestamp = {};
      if (start_date) filter.timestamp.$gte = new Date(start_date);
      if (end_date) filter.timestamp.$lte = new Date(end_date);
    }

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const action_types = await AuditLog.distinct("action");
    const collections = await AuditLog.distinct("target_collection");

    return Response.json({
      logs,
      action_types,
      collections,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Audit logs error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
