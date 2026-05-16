import { NextRequest } from "next/server";
import { requireAdminOrFounder } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { Transaction } from "@/models/billing/Transaction";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.string().optional(),
  type: z.string().optional(),
  user_id: z.string().optional(),
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

    const { page, limit, status, type, user_id } = parsed.data;
    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (user_id) filter.user_id = user_id;

    const [total, transactions] = await Promise.all([
      Transaction.countDocuments(filter),
      Transaction.find(filter).sort({ processed_at: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ]);

    return Response.json({
      transactions,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Transactions error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
