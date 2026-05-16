import { NextRequest } from "next/server";
import { getTokenFromRequest } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { checkCascadingExpiry } from "@/lib/subscription";
import { updateProfileSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.type !== "user") {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(payload.sub)
      .select("-password_hash -refresh_tokens -audit_log -email_verification_token -password_reset_token")
      .lean();

    if (!user || (user as any).is_deleted) {
      return Response.json({ error: "غير موجود" }, { status: 404 });
    }

    const u = user as any;

    if (u.account_type === "sub_user" && u.owner_id) {
      const cascading = await checkCascadingExpiry(u._id.toString());
      if (cascading.blocked) {
        return Response.json({ error: cascading.reason || "تم تعليق حسابك من قبل الإدارة" }, { status: 403 });
      }
    }

    return Response.json({
      user: {
        id: u._id.toString(),
        username: u.username,
        email: u.email,
        full_name: u.full_name,
        phone: u.phone,
        role: u.role,
        account_type: u.account_type || "client",
        owner_id: u.owner_id?.toString() || null,
        serial_number: u.serial_number || null,
        max_team_members: u.max_team_members || 0,
        team_members: u.team_members || [],
        company_name: u.company_name || null,
        email_verified: u.email_verified,
        activation: u.activation,
        hardware_hash: u.hardware_hash ? u.hardware_hash.substring(0, 16) + "..." : null,
        hardware_first_login: u.hardware_first_login,
        sessions: (u.sessions || []).slice(-10),
        created_at: u.created_at,
        last_login: u.last_login,
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

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const update: Record<string, any> = { last_modified: new Date() };
    if (parsed.data.full_name !== undefined) update.full_name = parsed.data.full_name;
    if (parsed.data.phone !== undefined) update.phone = parsed.data.phone || null;
    if (parsed.data.company_name !== undefined) update.company_name = parsed.data.company_name || null;

    const user = await User.findByIdAndUpdate(payload.sub, { $set: update }, { new: true })
      .select("-password_hash -refresh_tokens -audit_log -email_verification_token -password_reset_token")
      .lean();

    if (!user || (user as any).is_deleted) {
      return Response.json({ error: "غير موجود" }, { status: 404 });
    }

    const u = user as any;
    return Response.json({
      message: "تم تحديث الملف الشخصي",
      user: {
        id: u._id.toString(), username: u.username, email: u.email,
        full_name: u.full_name, phone: u.phone, company_name: u.company_name,
        role: u.role, account_type: u.account_type || "client",
        serial_number: u.serial_number || null,
      },
    });
  } catch (error) {
    console.error("User update error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
