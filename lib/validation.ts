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
  role: z.enum(["admin", "accountant", "sales", "employee"]),
  plan: z.enum(["trial", "monthly", "half_yearly", "yearly", "lifetime"]).optional().default("monthly"),
  subscription_days: z.number().int().positive().optional().default(30),
});

export const updateUserSchema = z.object({
  full_name: z.string().min(1).optional(),
  phone: phoneSchema,
  role: z.enum(["admin", "accountant", "sales", "employee"]).optional(),
  is_active: z.boolean().optional(),
  activation_status: z.enum(["active", "suspended", "expired", "trial"]).optional(),
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
  role: z.enum(["admin", "accountant", "sales", "employee", "all"]).optional().default("all"),
  sort_by: z.enum(["username", "email", "created_at", "last_login", "activation.status"]).optional().default("created_at"),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
});
