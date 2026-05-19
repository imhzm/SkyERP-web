import { NextRequest } from "next/server";
import { getTokenFromRequest } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { Invoice } from "@/models/billing/Invoice";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export async function GET(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.type !== "user") {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = await checkRateLimit(`invoices:${payload.sub}`, "api:user-invoices");
  if (!rl.allowed) return getRateLimitResponse(rl.resetIn);

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return Response.json({ error: "معاملات غير صحيحة" }, { status: 400 });
    }

    const { page, limit } = parsed.data;
    const filter: Record<string, any> = { user_id: payload.sub };
    if (payload.organization_id) filter.organization_id = payload.organization_id;

    const [total, invoices] = await Promise.all([
      Invoice.countDocuments(filter),
      Invoice.find(filter).sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit).select("-payment_method -payment_reference -notes").lean(),
    ]);

    return Response.json({
      invoices,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("User invoices error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
