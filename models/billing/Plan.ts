import mongoose, { Schema, Document } from "mongoose";

export interface IPlan extends Document {
  name: string;
  key: "trial" | "monthly" | "half_yearly" | "yearly" | "lifetime";
  duration_days: number;
  price: number;
  currency: string;
  grace_period_days: number;
  max_devices: number;
  features: string[];
  allowed_apps: string[] | "*";
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

const PlanSchema = new Schema<IPlan>({
  name: { type: String, required: true },
  key: { type: String, enum: ["trial", "monthly", "half_yearly", "yearly", "lifetime"], unique: true, required: true },
  duration_days: { type: Number, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: "EGP" },
  grace_period_days: { type: Number, default: 7 },
  max_devices: { type: Number, default: 1 },
  features: [{ type: String }],
  allowed_apps: { type: Schema.Types.Mixed, default: "*" },
  is_active: { type: Boolean, default: true },
  sort_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { collection: "plans" });

export const Plan = mongoose.models.Plan || mongoose.model<IPlan>("Plan", PlanSchema);
