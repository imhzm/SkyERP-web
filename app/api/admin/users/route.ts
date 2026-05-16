import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { requireAdminOrFounder } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { generateSerialNumber } from "@/models/SerialNumber";
import { hashPassword } from "@/lib/auth";
import { createUserSchema, paginationSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  const url = new URL(request.url);
  const params = {
    page: url.searchParams.get("page") || "1",
    limit: url.searchParams.get("limit") || "20",
    search: url.searchParams.get("search") || undefined,
    status: url.searchParams.get("status") || "all",
    account_type: url.searchParams.get("account_type") || "all",
    role: url.searchParams.get("role") || "all",
    sort_by: url.searchParams.get("sort_by") || "created_at",
    sort_order: url.searchParams.get("sort_order") || "desc",
  };

  const parsed = paginationSchema.safeParse(params);
  if (!parsed.success) {
    return Response.json({ error: "معاملات غير صالحة" }, { status: 400 });
  }

  const { page, limit, search, status, account_type, role, sort_by, sort_order } = parsed.data;

  try {
    await connectDB();

    const filter: Record<string, any> = { is_deleted: { $ne: true } };

    if (status !== "all") {
      if (status === "active") filter["activation.status"] = "active";
      else if (status === "suspended") filter["activation.status"] = "suspended";
      else if (status === "expired") {
        filter["activation.status"] = { $in: ["expired", "trial"] };
      } else if (status === "trial") filter["activation.status"] = "trial";
    }

    if (account_type !== "all") {
      filter.account_type = account_type;
    }

    if (role !== "all") {
      filter.role = role;
    }

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { username: regex },
        { email: regex },
        { full_name: regex },
      ];
    }

    const sort: Record<string, 1 | -1> = {};
    sort[sort_by] = sort_order === "asc" ? 1 : -1;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password_hash -refresh_tokens -audit_log")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const mapped = users.map((u: any) => ({
      id: u._id.toString(),
      username: u.username,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      account_type: u.account_type || "client",
      owner_id: u.owner_id?.toString() || null,
      serial_number: u.serial_number || null,
      team_members: (u.team_members || []).length,
      max_team_members: u.max_team_members || 0,
      company_name: u.company_name || null,
      tags: u.tags || [],
      is_active: u.is_active,
      activation_status: u.activation?.status || "trial",
      subscription_plan: u.activation?.subscription?.plan || "trial",
      subscription_end: u.activation?.subscription?.end_date,
      trial_end: u.activation?.trial_end,
      has_hardware_binding: !!u.hardware_hash,
      hardware_first_login: u.hardware_first_login,
      last_login: u.last_login,
      created_at: u.created_at,
      phone: u.phone,
      email_verified: u.email_verified,
    }));

    return Response.json({
      users: mapped,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin list users error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "بيانات غير صالحة" }, { status: 400 }); }

  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return Response.json({ error: firstError.message, field: firstError.path[0] }, { status: 400 });
  }

  const { username, email, phone, password, full_name, role, account_type, owner_id, plan, subscription_days, max_team_members, company_name, notes, tags } = parsed.data;

  try {
    await connectDB();

    const existing = await User.findOne({
      $or: [
        { username_key: username.toLowerCase() },
        { email: email.toLowerCase() },
      ],
    });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? "email" : "username";
      return Response.json(
        { error: field === "email" ? "البريد الإلكتروني مستخدم بالفعل" : "اسم المستخدم مستخدم بالفعل" },
        { status: 409 }
      );
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + subscription_days * 24 * 60 * 60 * 1000);
    const effectiveAccountType = account_type || (role === "sub_user" ? "sub_user" : "client");
    const serial = effectiveAccountType === "client" ? await generateSerialNumber() : null;
    const effectiveMaxTeam = effectiveAccountType === "client" ? (max_team_members || 0) : 0;

    const user = await User.create({
      username,
      username_key: username.toLowerCase(),
      email: email.toLowerCase(),
      email_verified: true,
      password_hash: hashPassword(password),
      full_name,
      phone: phone || null,
      role: effectiveAccountType === "sub_user" ? "sub_user" : "client",
      account_type: effectiveAccountType,
      owner_id: owner_id || null,
      serial_number: serial,
      max_team_members: effectiveMaxTeam,
      company_name: company_name || null,
      notes: notes || "",
      tags: tags || [],
      created_by_admin_id: payload.sub ? new mongoose.Types.ObjectId(payload.sub) : null,
      is_active: true,
      activation: {
        status: effectiveAccountType === "sub_user" ? "active" : "active",
        max_devices: 1,
        subscription: {
          plan,
          start_date: now,
          end_date: endDate,
          auto_renew: false,
          grace_period_end: new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      created_at: now,
      last_modified: now,
      sync_status: "synced",
    });

    await writeAuditLog({
      target_collection: "users",
      action: "admin_create_user",
      target_id: user._id.toString(),
      target_username: username,
      performed_by: payload.email,
      performed_by_type: "admin",
      actor_role: (payload.role as any) || "admin",
      details: { role, account_type, plan, subscription_days, serial_number: serial },
      success: true,
    });

    return Response.json({
      message: "تم إنشاء المستخدم بنجاح",
      user: { id: user._id.toString(), username: user.username, email: user.email, role: user.role },
    }, { status: 201 });
  } catch (error) {
    console.error("Admin create user error:", error);
    return Response.json({ error: "حدث خطأ أثناء إنشاء المستخدم" }, { status: 500 });
  }
}
