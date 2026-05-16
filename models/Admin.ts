import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  password_hash: string;
  full_name: string;
  role: "founder" | "super_admin" | "admin" | "support";
  permissions: {
    can_manage_users: boolean;
    can_manage_billing: boolean;
    can_view_audit: boolean;
    can_manage_admins: boolean;
    can_manage_settings: boolean;
  };
  notes: string;
  created_by: mongoose.Types.ObjectId | null;
  is_active: boolean;
  two_factor_enabled: boolean;
  created_at: Date;
  last_login: Date | null;
  login_attempts: number;
  locked_until: Date | null;
  refresh_tokens: {
    token_hash: string;
    device_info: string;
    ip: string;
    created_at: Date;
    expires_at: Date;
  }[];
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  full_name: { type: String, required: true },
  role: { type: String, enum: ["founder", "super_admin", "admin", "support"], default: "admin" },
  permissions: {
    can_manage_users: { type: Boolean, default: false },
    can_manage_billing: { type: Boolean, default: false },
    can_view_audit: { type: Boolean, default: false },
    can_manage_admins: { type: Boolean, default: false },
    can_manage_settings: { type: Boolean, default: false },
  },
  notes: { type: String, default: "" },
  created_by: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
  is_active: { type: Boolean, default: true },
  two_factor_enabled: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  last_login: { type: Date, default: null },
  login_attempts: { type: Number, default: 0 },
  locked_until: { type: Date, default: null },
  refresh_tokens: [{
    token_hash: String,
    device_info: String,
    ip: String,
    created_at: Date,
    expires_at: Date,
  }],
}, { collection: "admin" });

export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);
