import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  invoice_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  organization_id: mongoose.Types.ObjectId | null;
  username: string;
  type: "payment" | "refund" | "adjustment";
  amount: number;
  currency: string;
  payment_method: "cash" | "bank_transfer" | "credit_card" | "wallet" | "manual";
  payment_reference: string | null;
  status: "completed" | "pending" | "failed" | "cancelled";
  processed_by: string;
  notes: string;
  processed_at: Date;
  created_at: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  invoice_id: { type: Schema.Types.ObjectId, ref: "Invoice", required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  organization_id: { type: Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
  username: { type: String, required: true },
  type: { type: String, enum: ["payment", "refund", "adjustment"], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "EGP" },
  payment_method: { type: String, enum: ["cash", "bank_transfer", "credit_card", "wallet", "manual"], required: true },
  payment_reference: { type: String, default: null },
  status: { type: String, enum: ["completed", "pending", "failed", "cancelled"], default: "completed" },
  processed_by: { type: String, required: true },
  notes: { type: String, default: "" },
  processed_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
}, { collection: "transactions" });

TransactionSchema.index({ invoice_id: 1 });
TransactionSchema.index({ user_id: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ processed_at: -1 });

export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);
