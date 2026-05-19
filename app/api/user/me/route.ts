import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { getTokenFromRequest } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { checkCascadingExpiry } from "@/lib/subscription";
import { updateProfileSchema } from "@/lib/validation";

interface MeUserResult {
  _id: mongoose.Types.ObjectId;
  is_deleted: boolean;
  account_type: string;
  owner_id?: mongoose.Types.ObjectId;
  username: string;
  email: string;
  full_name: string;
  role: string;
  phone: string;
  organization_id?: string;
  permissions?: string[];
  is_active?: boolean;
  activation?: Record<string, unknown>;
  serial_number?: string;
  company_name?: string;
  hardware_hash?: string;
  team_members?: number;
  max_team_members?: number;
  sessions?: Record<string, unknown>[];
  created_at?: Date;
  last_login?: Date;
  hardware_first_login?: Date;
}

export async function GET(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.type !== "user") {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(payload.sub)
      .select("-password_hash -refresh_tokens -audit_log -email_verification_token -password_reset_token")
      .lean<MeUserResult | null>();

    if (!user || user.is_deleted) {
      return Response.json({ error: "غير موجود" }, { status: 404 });
    }

    if (user.account_type === "sub_user" && user.owner_id) {
      const cascading = await checkCascadingExpiry(user._id.toString());
      if (cascading.blocked) {
        return Response.json({ error: cascading.reason || "تم تعليق حسابك من قبل الإدارة" }, { status: 403 });
      }
    }

    return Response.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone,
        account_type: user.account_type || "client",
        serial_number: user.serial_number || null,
        company_name: user.company_name || null,
        organization_id: user.organization_id?.toString() || null,
        permissions: user.permissions || [],
        activation: {
          status: user.activation?.status || "trial",
          trial_end: user.activation?.trial_end || null,
          max_devices: (user.activation as Record<string, unknown>)?.max_devices || 1,
          subscription: {
            plan: ((user.activation as Record<string, unknown>)?.subscription as Record<string, unknown>)?.plan || "trial",
            end_date: ((user.activation as Record<string, unknown>)?.subscription as Record<string, unknown>)?.end_date || null,
          },
        },
        sessions: (user.sessions || []).slice(-5).map((s: Record<string, unknown>) => ({
          id: s.id, type: s.type, device_info: s.device_info,
          ip: typeof s.ip === "string" ? s.ip.replace(/\.\d+$/, ".0") : s.ip,
          login_at: s.login_at, last_active: s.last_active,
        })),
        created_at: user.created_at,
        last_login: user.last_login || null,
        max_team_members: user.max_team_members || 0,
        has_hardware_binding: !!user.hardware_hash,
        hardware_first_login: user.hardware_first_login || null,
      },
    });
  } catch (error) {
    console.error("User me error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.type !== "user") {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    await connectDB();

    let body: unknown;
    try { body = await request.json(); } catch { return Response.json({ error: "بيانات غير صالحة" }, { status: 400 }); }
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const update: Record<string, unknown> = { last_modified: new Date() };
    if (parsed.data.full_name !== undefined) update.full_name = parsed.data.full_name;
    if (parsed.data.phone !== undefined) update.phone = parsed.data.phone || null;
    if (parsed.data.company_name !== undefined) update.company_name = parsed.data.company_name || null;

    const updated = await User.findByIdAndUpdate(payload.sub, { $set: update }, { new: true })
      .select("-password_hash -refresh_tokens -audit_log -email_verification_token -password_reset_token")
      .lean<MeUserResult | null>();

    if (!updated || updated.is_deleted) {
      return Response.json({ error: "غير موجود" }, { status: 404 });
    }

    return Response.json({
      message: "تم تحديث الملف الشخصي",
      user: {
        id: updated._id.toString(), username: updated.username, email: updated.email,
        full_name: updated.full_name, phone: updated.phone, company_name: updated.company_name,
        role: updated.role, account_type: updated.account_type || "client",
        serial_number: updated.serial_number || null,
      },
    });
  } catch (error) {
    console.error("User update error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
