import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  password_hash: string;
  full_name: string;
  role: "super_admin" | "admin";
  is_active: boolean;
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
  role: { type: String, enum: ["super_admin", "admin"], default: "admin" },
  is_active: { type: Boolean, default: true },
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
