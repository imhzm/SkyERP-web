import { NextRequest } from "next/server";
import { requireAdminOrFounder } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { Invoice } from "@/models/billing/Invoice";
import { Transaction } from "@/models/billing/Transaction";
import { User } from "@/models/User";
import { writeAuditLog, toAuditRole } from "@/lib/audit";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.string().optional(),
  user_id: z.string().optional(),
});

const createInvoiceSchema = z.object({
  user_id: z.string().min(1),
  plan: z.enum(["trial", "monthly", "half_yearly", "yearly", "lifetime"]),
  amount: z.number().positive(),
  due_date: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "ØºÙŠØ± Ù…ØµØ±Ø­" }, { status: 401 });

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return Response.json({ error: "Ù…Ø¹Ø§Ù…Ù„Ø§Øª ØºÙŠØ± ØµØ­ÙŠØ­Ø©" }, { status: 400 });
    }

    const { page, limit, status, user_id } = parsed.data;
    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (user_id) filter.user_id = user_id;

    const [total, invoices] = await Promise.all([
      Invoice.countDocuments(filter),
      Invoice.find(filter).sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ]);

    return Response.json({
      invoices,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Invoices error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "ØºÙŠØ± Ù…ØµØ±Ø­" }, { status: 401 });
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  try {
    await connectDB();
    const body = await request.json();
    const parsed = createInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Ø¨ÙŠØ§Ù†Ø§Øª ØºÙŠØ± ØµØ­ÙŠØ­Ø©", issues: parsed.error.issues }, { status: 400 });
    }

    const user = await User.findById(parsed.data.user_id);
    if (!user) return Response.json({ error: "Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯" }, { status: 404 });

    const now = new Date();
    const prefix = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-`;
    const lastInv = await Invoice.findOne({ invoice_number: { $regex: `^${prefix}` } }).sort({ invoice_number: -1 }).select("invoice_number").lean();
    const nextSeq = lastInv ? parseInt(lastInv.invoice_number.slice(-5), 10) + 1 : 1;
    const invoice_number = `${prefix}${String(nextSeq).padStart(5, "0")}`;
    const due_date = parsed.data.due_date ? new Date(parsed.data.due_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const invoice = await Invoice.create({
      invoice_number,
      user_id: user._id,
      username: user.username,
      email: user.email,
      organization_id: user.organization_id || null,
      plan: parsed.data.plan,
      amount: parsed.data.amount,
      due_date,
      notes: parsed.data.notes || "",
      items: [{ description: `Ø§Ø´ØªØ±Ø§Ù ${parsed.data.plan}`, quantity: 1, unit_price: parsed.data.amount, total: parsed.data.amount }],
      created_by: payload.email || "admin",
    });

    await writeAuditLog({
      target_collection: "invoices",
      action: "admin_create_invoice",
      target_id: invoice._id.toString(),
      target_username: user.username,
      performed_by: payload.email || "admin",
      performed_by_type: "admin",
      actor_role: toAuditRole(payload.role),
      organization_id: payload.organization_id,
      ip_address: ip,
      success: true,
      details: { invoice_number, amount: parsed.data.amount, plan: parsed.data.plan },
    });

    return Response.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error("Create invoice error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£" }, { status: 500 });
  }
}
