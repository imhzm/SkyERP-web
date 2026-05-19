import mongoose, { Schema, Document } from "mongoose";

export interface IInvoice extends Document {
  invoice_number: string;
  user_id: mongoose.Types.ObjectId;
  organization_id: mongoose.Types.ObjectId | null;
  username: string;
  email: string;
  plan: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "overdue" | "cancelled" | "refunded";
  issued_date: Date;
  due_date: Date;
  paid_date: Date | null;
  payment_method: string | null;
  payment_reference: string | null;
  notes: string;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  invoice_number: { type: String, required: true, unique: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  organization_id: { type: Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  plan: { type: String, enum: ["trial", "monthly", "half_yearly", "yearly", "lifetime"], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "EGP" },
  status: { type: String, enum: ["pending", "paid", "overdue", "cancelled", "refunded"], default: "pending" },
  issued_date: { type: Date, default: Date.now },
  due_date: { type: Date, required: true },
  paid_date: { type: Date, default: null },
  payment_method: { type: String, default: null },
  payment_reference: { type: String, default: null },
  notes: { type: String, default: "" },
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true },
    total: { type: Number, required: true },
  }],
  created_by: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { collection: "invoices" });

InvoiceSchema.index({ invoice_number: 1 }, { unique: true });
InvoiceSchema.index({ user_id: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ due_date: 1 });
InvoiceSchema.index({ created_at: -1 });

export const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);
