import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  username_key: string;
  email: string;
  email_verified: boolean;
  email_verification_token: string | null;
  email_verification_sent_at: Date | null;
  password_hash: string;
  password_changed_at: Date | null;
  password_reset_token: string | null;
  password_reset_expires: Date | null;
  role: "client" | "sub_user";
  full_name: string;
  phone: string | null;
  is_active: boolean;
  is_deleted: boolean;
  sync_status: string;
  account_type: "client" | "sub_user";
  owner_id: mongoose.Types.ObjectId | null;
  serial_number: string | null;
  team_members: mongoose.Types.ObjectId[];
  max_team_members: number;
  company_name: string | null;
  notes: string;
  tags: string[];
  profile_image_url: string | null;
  created_by_admin_id: mongoose.Types.ObjectId | null;
  hardware_hash: string | null;
  hardware_first_login: Date | null;
  hardware_info: {
    hostname: string;
    os: string;
    registered_ip: string;
    last_seen_device_name: string;
  } | null;
  activation: {
    status: "active" | "suspended" | "expired" | "trial";
    trial_start: Date | null;
    trial_end: Date | null;
    max_devices: number;
    subscription: {
      plan: "trial" | "monthly" | "half_yearly" | "yearly" | "lifetime";
      start_date: Date | null;
      end_date: Date | null;
      auto_renew: boolean;
      grace_period_end: Date | null;
    };
  };
  failed_login_attempts: number;
  locked_until: Date | null;
  refresh_tokens: {
    token_hash: string;
    device_info: string;
    ip: string;
    created_at: Date;
    expires_at: Date;
  }[];
  sessions: {
    id: string;
    type: "web" | "desktop";
    device_info: string;
    ip: string;
    login_at: Date;
    last_active: Date;
  }[];
  audit_log: {
    action: string;
    timestamp: Date;
    ip: string;
    details: string;
  }[];
  created_at: Date;
  last_modified: Date;
  last_login: Date | null;
  linked_employee_id: number | null;
  linked_employee_code: string | null;
  custom_permissions: Record<string, any> | null;
  desktop_role: "admin" | "accountant" | "sales" | "employee" | null;
  organization_id: mongoose.Types.ObjectId | null;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true },
  username_key: { type: String, required: true, unique: true, lowercase: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email_verified: { type: Boolean, default: false },
  email_verification_token: { type: String, default: null },
  email_verification_sent_at: { type: Date, default: null },
  password_hash: { type: String, required: true },
  password_changed_at: { type: Date, default: null },
  password_reset_token: { type: String, default: null },
  password_reset_expires: { type: Date, default: null },
  role: { type: String, enum: ["client", "sub_user"], default: "client" },
  full_name: { type: String, default: "" },
  phone: { type: String, default: null },
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
  sync_status: { type: String, default: "synced" },
  account_type: { type: String, enum: ["client", "sub_user"], default: "client" },
  owner_id: { type: Schema.Types.ObjectId, ref: "User", default: null },
  serial_number: { type: String, default: null },
  team_members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  max_team_members: { type: Number, default: 0 },
  company_name: { type: String, default: null },
  notes: { type: String, default: "" },
  tags: [{ type: String }],
  profile_image_url: { type: String, default: null },
  created_by_admin_id: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
  hardware_hash: { type: String, default: null },
  hardware_first_login: { type: Date, default: null },
  hardware_info: { type: Schema.Types.Mixed, default: null },
  activation: { type: Schema.Types.Mixed, default: { status: "trial", max_devices: 1, subscription: { plan: "trial", auto_renew: false } } },
  failed_login_attempts: { type: Number, default: 0 },
  locked_until: { type: Date, default: null },
  refresh_tokens: [{
    token_hash: String,
    device_info: String,
    ip: String,
    created_at: Date,
    expires_at: Date,
  }],
  sessions: [{
    id: String,
    type: { type: String, enum: ["web", "desktop"] },
    device_info: String,
    ip: String,
    login_at: Date,
    last_active: Date,
  }],
  audit_log: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    ip: String,
    details: String,
  }],
  created_at: { type: Date, default: Date.now },
  last_modified: { type: Date, default: Date.now },
  last_login: { type: Date, default: null },
  linked_employee_id: { type: Number, default: null },
  linked_employee_code: { type: String, default: null },
  custom_permissions: { type: Schema.Types.Mixed, default: null },
  desktop_role: { type: String, enum: ["admin", "accountant", "sales", "employee", null], default: null },
  organization_id: { type: Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
});

UserSchema.index({ "activation.status": 1 });
UserSchema.index({ last_modified: -1 });
UserSchema.index({ is_deleted: 1 });
UserSchema.index({ owner_id: 1 });
UserSchema.index({ serial_number: 1 }, { sparse: true });
UserSchema.index({ account_type: 1 });
UserSchema.index({ password_reset_token: 1 }, { sparse: true });

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
