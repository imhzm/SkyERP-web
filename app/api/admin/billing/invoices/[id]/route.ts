import { NextRequest } from "next/server";
import { requireAdminOrFounder } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { Invoice } from "@/models/billing/Invoice";
import { Transaction } from "@/models/billing/Transaction";
import { writeAuditLog, toAuditRole } from "@/lib/audit";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["pending", "paid", "overdue", "cancelled", "refunded"]).optional(),
  notes: z.string().optional(),
});

const paymentSchema = z.object({
  amount: z.number().positive(),
  payment_method: z.enum(["cash", "bank_transfer", "credit_card", "wallet", "manual"]),
  payment_reference: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "ØºÙŠØ± Ù…ØµØ±Ø­" }, { status: 401 });

  const { id } = await params;

  try {
    await connectDB();
    const invoice = await Invoice.findById(id).lean();
    if (!invoice) return Response.json({ error: "Ø§Ù„ÙØ§ØªÙˆØ±Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©" }, { status: 404 });

    const transactions = await Transaction.find({ invoice_id: id }).sort({ processed_at: -1 }).lean();
    return Response.json({ invoice, transactions });
  } catch (error) {
    console.error("Invoice detail error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "ØºÙŠØ± Ù…ØµØ±Ø­" }, { status: 401 });
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { id } = await params;

  try {
    await connectDB();
    const body = await request.json();

    if (body.action === "mark_paid") {
      const parsed = paymentSchema.safeParse(body);
      if (!parsed.success) {
        return Response.json({ error: "Ø¨ÙŠØ§Ù†Ø§Øª ØºÙŠØ± ØµØ­ÙŠØ­Ø©", issues: parsed.error.issues }, { status: 400 });
      }

      const invoice = await Invoice.findById(id);
      if (!invoice) return Response.json({ error: "Ø§Ù„ÙØ§ØªÙˆØ±Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©" }, { status: 404 });

      invoice.status = "paid";
      invoice.paid_date = new Date();
      invoice.payment_method = parsed.data.payment_method;
      invoice.payment_reference = parsed.data.payment_reference || null;
      await invoice.save();

      const invoice_num = invoice.invoice_number;
      const transaction = await Transaction.create({
        invoice_id: invoice._id,
        user_id: invoice.user_id,
        username: invoice.username,
        organization_id: invoice.organization_id || null,
        type: "payment",
        amount: parsed.data.amount,
        payment_method: parsed.data.payment_method,
        payment_reference: parsed.data.payment_reference || null,
        status: "completed",
        processed_by: payload.email || "admin",
        notes: parsed.data.notes || `Ø¯ÙØ¹ Ø§ÙÙØ§ØªÙˆØ±Ø© ${invoice_num}`,
      });

      await writeAuditLog({
        target_collection: "invoices",
        action: "admin_mark_paid",
        target_id: invoice._id.toString(),
        target_username: invoice.username,
        performed_by: payload.email || "admin",
        performed_by_type: "admin",
        actor_role: toAuditRole(payload.role),
        organization_id: payload.organization_id,
        ip_address: ip,
        success: true,
        details: { invoice_number: invoice_num, amount: parsed.data.amount, method: parsed.data.payment_method },
      });

      return Response.json({ invoice, transaction });
    }

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Ø¨ÙŠØ§Ù†Ø§Øª ØºÙŠØ± ØµØ­ÙŠØ­Ø©", issues: parsed.error.issues }, { status: 400 });
    }

    const invoice = await Invoice.findByIdAndUpdate(id, { $set: parsed.data }, { new: true });
    if (!invoice) return Response.json({ error: "Ø§Ù„ÙØ§ØªÙˆØ±Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©" }, { status: 404 });

    return Response.json({ invoice });
  } catch (error) {
    console.error("Invoice update error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£" }, { status: 500 });
  }
}
