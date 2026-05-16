import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(12, "كلمة المرور يجب أن تكون 12 حرفًا على الأقل")
  .max(128)
  .regex(/[a-z]/, "يجب أن تحتوي على حرف صغير")
  .regex(/[A-Z]/, "يجب أن تحتوي على حرف كبير")
  .regex(/[0-9]/, "يجب أن تحتوي على رقم")
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "يجب أن تحتوي على رمز خاص");

export const emailSchema = z
  .string()
  .email("البريد الإلكتروني غير صالح")
  .max(255)
  .transform((e) => e.toLowerCase().trim());

export const usernameSchema = z
  .string()
  .min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
  .max(30, "اسم المستخدم يجب أن يكون 30 حرفًا كحد أقصى")
  .regex(/^[a-zA-Z0-9_\-]+$/, "اسم المستخدم يمكن أن يحتوي فقط على أحرف إنجليزية وأرقام و _ و -");

export const phoneSchema = z
  .string()
  .regex(/^\+?[0-9]{7,15}$/, "رقم الهاتف غير صالح")
  .optional()
  .nullable();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "كلمة المرور غير متطابقة",
  path: ["confirm_password"],
});

export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: passwordSchema,
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "كلمة المرور غير متطابقة",
  path: ["confirm_password"],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "كلمة المرور غير متطابقة",
  path: ["confirm_password"],
});

export const createUserSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: z.string().min(8).max(128),
  full_name: z.string().min(1, "الاسم كامل مطلوب"),
  role: z.enum(["client", "sub_user"]).optional().default("client"),
  account_type: z.enum(["client", "sub_user"]).optional().default("client"),
  owner_id: z.string().optional().nullable(),
  plan: z.enum(["trial", "monthly", "half_yearly", "yearly", "lifetime"]).optional().default("monthly"),
  subscription_days: z.number().int().positive().optional().default(30),
  max_team_members: z.number().int().min(0).optional().default(0),
  company_name: z.string().max(100).optional().nullable(),
  notes: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
});

export const updateUserSchema = z.object({
  full_name: z.string().min(1).optional(),
  phone: phoneSchema,
  role: z.enum(["client", "sub_user"]).optional(),
  account_type: z.enum(["client", "sub_user"]).optional(),
  is_active: z.boolean().optional(),
  activation_status: z.enum(["active", "suspended", "expired", "trial"]).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  company_name: z.string().max(100).optional().nullable(),
  max_team_members: z.number().int().min(0).optional(),
});

export const updateSubscriptionSchema = z.object({
  plan: z.enum(["trial", "monthly", "half_yearly", "yearly", "lifetime"]),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().nullable().optional(),
  auto_renew: z.boolean().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["active", "suspended", "expired", "trial", "all"]).optional().default("all"),
  account_type: z.enum(["client", "sub_user", "all"]).optional().default("all"),
  role: z.enum(["client", "sub_user", "all"]).optional().default("all"),
  sort_by: z.enum(["username", "email", "created_at", "last_login", "activation.status"]).optional().default("created_at"),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const createTeamSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: z.string().min(8).max(128),
  full_name: z.string().min(1, "الاسم كامل مطلوب"),
});

export const updateTeamSchema = z.object({
  full_name: z.string().min(1).optional(),
  phone: phoneSchema,
  is_active: z.boolean().optional(),
});

export const createAdminSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
  full_name: z.string().min(1, "الاسم كامل مطلوب"),
  role: z.enum(["super_admin", "admin", "support"]).optional().default("admin"),
  permissions: z.object({
    can_manage_users: z.boolean().optional().default(false),
    can_manage_billing: z.boolean().optional().default(false),
    can_view_audit: z.boolean().optional().default(false),
    can_manage_admins: z.boolean().optional().default(false),
    can_manage_settings: z.boolean().optional().default(false),
  }).optional(),
  notes: z.string().optional().default(""),
});

export const updateAdminSchema = z.object({
  full_name: z.string().min(1).optional(),
  role: z.enum(["super_admin", "admin", "support"]).optional(),
  is_active: z.boolean().optional(),
  permissions: z.object({
    can_manage_users: z.boolean().optional(),
    can_manage_billing: z.boolean().optional(),
    can_view_audit: z.boolean().optional(),
    can_manage_admins: z.boolean().optional(),
    can_manage_settings: z.boolean().optional(),
  }).optional(),
  notes: z.string().optional(),
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(1).optional(),
  phone: phoneSchema,
  company_name: z.string().max(100).optional().nullable(),
});

export const systemSettingsSchema = z.object({
  allow_open_registration: z.boolean().optional(),
  trial_duration_days: z.number().int().min(1).max(365).optional(),
  default_trial_plan: z.enum(["trial", "monthly"]).optional(),
  max_login_attempts: z.number().int().min(1).max(20).optional(),
  lockout_duration_minutes: z.number().int().min(1).max(1440).optional(),
  refresh_token_expiry_days: z.number().int().min(1).max(90).optional(),
  max_sessions_per_user: z.number().int().min(1).max(50).optional(),
});
