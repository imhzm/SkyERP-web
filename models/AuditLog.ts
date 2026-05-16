import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  target_collection: string;
  action: string;
  target_id: string | null;
  target_username: string | null;
  performed_by: string | null;
  performed_by_type: "user" | "admin" | "system";
  ip_address: string;
  user_agent: string;
  details: Record<string, any>;
  timestamp: Date;
  success: boolean;
}

const AuditLogSchema = new Schema<IAuditLog>({
  target_collection: { type: String, required: true },
  action: { type: String, required: true },
  target_id: { type: String, default: null },
  target_username: { type: String, default: null },
  performed_by: { type: String, default: null },
  performed_by_type: { type: String, enum: ["user", "admin", "system"], default: "system" },
  ip_address: { type: String, default: "" },
  user_agent: { type: String, default: "" },
  details: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
  success: { type: Boolean, required: true },
}, { collection: "audit_log" });

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ target_id: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ performed_by: 1 });
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
