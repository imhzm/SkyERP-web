import { NextRequest } from "next/server";
import { requireAdminOrFounder } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { Invoice } from "@/models/billing/Invoice";
import { Transaction } from "@/models/billing/Transaction";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import { Plan } from "@/models/billing/Plan";
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

async function activateUserSubscription(userId: string, planKey: string, invoice: any) {
  const now = new Date();
  const plan = await Plan.findOne({ key: planKey, is_active: true }).lean();
  const durationDays = plan ? plan.duration_days : (planKey === "monthly" ? 30 : planKey === "half_yearly" ? 183 : planKey === "yearly" ? 365 : planKey === "lifetime" ? 36500 : 30);
  const graceDays = plan ? plan.grace_period_days : 7;
  const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const graceEnd = new Date(endDate.getTime() + graceDays * 24 * 60 * 60 * 1000);

  await User.updateOne(
    { _id: userId },
    {
      $set: {
        is_active: true,
        locked_until: null,
        "activation.status": "active",
        "activation.subscription.plan": planKey,
        "activation.subscription.start_date": now,
        "activation.subscription.end_date": endDate,
        "activation.subscription.auto_renew": false,
        "activation.subscription.grace_period_end": graceEnd,
      },
    }
  );

  const user = await User.findById(userId).lean();
  if (user?.organization_id) {
    await Organization.updateOne(
      { _id: user.organization_id },
      {
        $set: {
          "subscription.status": "active",
          "subscription.plan": planKey,
          "subscription.start_date": now,
          "subscription.end_date": endDate,
          "subscription.auto_renew": false,
          "subscription.grace_period_end": graceEnd,
        },
      }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;

  try {
    await connectDB();
    const invoice = await Invoice.findById(id).lean();
    if (!invoice) return Response.json({ error: "الفاتورة غير موجودة" }, { status: 404 });

    const transactions = await Transaction.find({ invoice_id: id }).sort({ processed_at: -1 }).lean();
    return Response.json({ invoice, transactions });
  } catch (error) {
    console.error("Invoice detail error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { id } = await params;

  try {
    await connectDB();
    const body = await request.json();

    if (body.action === "mark_paid") {
      const parsed = paymentSchema.safeParse(body);
      if (!parsed.success) {
        return Response.json({ error: "بيانات غير صحيحة", issues: parsed.error.issues }, { status: 400 });
      }

      const invoice = await Invoice.findById(id);
      if (!invoice) return Response.json({ error: "الفاتورة غير موجودة" }, { status: 404 });

      if (invoice.status === "paid") {
        return Response.json({ error: "الفاتورة مدفوعة بالفعل" }, { status: 400 });
      }

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
        notes: parsed.data.notes || `دفع الفاتورة ${invoice_num}`,
      });

      if (invoice.plan) {
        await activateUserSubscription(invoice.user_id.toString(), invoice.plan, invoice);
      }

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
        details: { invoice_number: invoice_num, amount: parsed.data.amount, method: parsed.data.payment_method, subscription_activated: !!invoice.plan },
      });

      return Response.json({ invoice, transaction, subscription_activated: !!invoice.plan });
    }

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "بيانات غير صحيحة", issues: parsed.error.issues }, { status: 400 });
    }

    const invoice = await Invoice.findByIdAndUpdate(id, { $set: parsed.data }, { new: true });
    if (!invoice) return Response.json({ error: "الفاتورة غير موجودة" }, { status: 404 });

    return Response.json({ invoice });
  } catch (error) {
    console.error("Invoice update error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
