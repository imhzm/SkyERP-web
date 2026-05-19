import mongoose, { Schema, Document } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  slug: string;
  owner_id: mongoose.Types.ObjectId;
  admins: {
    user_id: mongoose.Types.ObjectId;
    role: "owner" | "admin";
    added_at: Date;
  }[];
  settings: {
    company_name: string;
    company_tagline: string;
    company_address: string;
    company_phone: string;
    company_email: string;
    company_logo_data: string;
    bank_name: string;
    bank_account: string;
    vodafone_cash: string;
    default_tax_rate: number;
    default_notes: string;
    print_client_logo_width_px: number;
    print_client_logo_max_height_px: number;
    hr_payroll_days_divisor: number;
    hr_standard_work_hours_per_day: number;
    hr_overtime_rate_multiplier: number;
    hr_workday_start_time: string;
    hr_workday_end_time: string;
    hr_late_grace_minutes: number;
    hr_early_leave_grace_minutes: number;
    hr_weekend_days: number[];
    hr_missing_attendance_counts_as_absence: boolean;
  };
  subscription: {
    plan: "trial" | "monthly" | "half_yearly" | "yearly" | "lifetime";
    status: "active" | "suspended" | "expired" | "trial";
    start_date: Date | null;
    end_date: Date | null;
    auto_renew: boolean;
    grace_period_end: Date | null;
    trial_start: Date | null;
    trial_end: Date | null;
  };
  limits: {
    max_users: number;
    max_devices: number;
  };
  serial_number: string | null;
  is_active: boolean;
  settings_last_modified: Date | null;
  settings_content_hash: string | null;
  created_at: Date;
  updated_at: Date;
}

const DEFAULT_SETTINGS: IOrganization["settings"] = {
  company_name: "",
  company_tagline: "",
  company_address: "",
  company_phone: "",
  company_email: "",
  company_logo_data: "",
  bank_name: "",
  bank_account: "",
  vodafone_cash: "",
  default_tax_rate: 0,
  default_notes: "",
  print_client_logo_width_px: 120,
  print_client_logo_max_height_px: 40,
  hr_payroll_days_divisor: 30,
  hr_standard_work_hours_per_day: 8,
  hr_overtime_rate_multiplier: 1.25,
  hr_workday_start_time: "09:00",
  hr_workday_end_time: "17:00",
  hr_late_grace_minutes: 15,
  hr_early_leave_grace_minutes: 15,
  hr_weekend_days: [4, 5],
  hr_missing_attendance_counts_as_absence: true,
};

const OrganizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  owner_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  admins: [{
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "admin"], default: "owner" },
    added_at: { type: Date, default: Date.now },
  }],
  settings: { type: Schema.Types.Mixed, default: DEFAULT_SETTINGS },
  subscription: {
    plan: { type: String, enum: ["trial", "monthly", "half_yearly", "yearly", "lifetime"], default: "trial" },
    status: { type: String, enum: ["active", "suspended", "expired", "trial"], default: "trial" },
    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },
    auto_renew: { type: Boolean, default: false },
    grace_period_end: { type: Date, default: null },
    trial_start: { type: Date, default: null },
    trial_end: { type: Date, default: null },
  },
  limits: {
    max_users: { type: Number, default: 1 },
    max_devices: { type: Number, default: 1 },
  },
  serial_number: { type: String, default: null },
  is_active: { type: Boolean, default: true },
  settings_last_modified: { type: Date, default: null },
  settings_content_hash: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

OrganizationSchema.index({ owner_id: 1 });
OrganizationSchema.index({ "admins.user_id": 1 });
OrganizationSchema.index({ is_active: 1 });
OrganizationSchema.index({ serial_number: 1 }, { sparse: true });
OrganizationSchema.index({ "subscription.status": 1 });

export const Organization = mongoose.models.Organization || mongoose.model<IOrganization>("Organization", OrganizationSchema);
