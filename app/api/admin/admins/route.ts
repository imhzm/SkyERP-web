import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { requireFounder } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import { hash } from "bcryptjs";
import { createAdminSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  role: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const payload = requireFounder(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  try {
    await connectDB();
    const url = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return Response.json({ error: "معاملات غير صالحة" }, { status: 400 });
    }

    const { page, limit, search, role, is_active } = parsed.data;
    const filter: Record<string, any> = {};

    if (role) filter.role = role;
    if (is_active !== undefined) filter.is_active = is_active;

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { email: regex },
        { full_name: regex },
      ];
    }

    const total = await Admin.countDocuments(filter);
    const admins = await Admin.find(filter)
      .select("-password_hash -refresh_tokens")
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return Response.json({
      admins: admins.map((a: any) => ({
        id: a._id.toString(),
        email: a.email,
        full_name: a.full_name,
        role: a.role,
        permissions: a.permissions,
        is_active: a.is_active,
        notes: a.notes || "",
        last_login: a.last_login,
        created_at: a.created_at,
        login_attempts: a.login_attempts,
      })),
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin list error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const payload = requireFounder(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  const rl = await checkRateLimit(`admin-create:${ip}`, "api:admin-mutate");
  if (!rl.allowed) return getRateLimitResponse(rl.resetIn);

  try {
    await connectDB();
    const body = await request.json();
    const parsed = createAdminSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message, field: parsed.error.issues[0].path[0] }, { status: 400 });
    }

    const existing = await Admin.findOne({ email: parsed.data.email.toLowerCase() });
    if (existing) {
      return Response.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });
    }

    const passwordHash = await hash(parsed.data.password, 12);

    const admin = await Admin.create({
      email: parsed.data.email.toLowerCase(),
      password_hash: passwordHash,
      full_name: parsed.data.full_name,
      role: parsed.data.role,
      permissions: {
        can_manage_users: parsed.data.permissions?.can_manage_users ?? (parsed.data.role === "super_admin"),
        can_manage_billing: parsed.data.permissions?.can_manage_billing ?? (parsed.data.role === "super_admin"),
        can_view_audit: parsed.data.permissions?.can_view_audit ?? (parsed.data.role === "super_admin"),
        can_manage_admins: false,
        can_manage_settings: parsed.data.permissions?.can_manage_settings ?? (parsed.data.role === "super_admin"),
      },
      notes: parsed.data.notes || "",
      created_by: new mongoose.Types.ObjectId(payload.sub),
      is_active: true,
    });

    await writeAuditLog({
      target_collection: "admin",
      action: "admin_create_admin",
      target_id: admin._id.toString(),
      target_username: admin.email,
      performed_by: payload.email,
      performed_by_type: "admin",
      actor_role: "founder",
      organization_id: payload.organization_id,
      ip_address: ip,
      details: { role: parsed.data.role },
      success: true,
    });

    return Response.json({
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        permissions: admin.permissions,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Admin create error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
