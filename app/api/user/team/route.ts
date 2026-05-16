import { NextRequest } from "next/server";
import { getTokenFromRequest } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { createTeamSchema } from "@/lib/validation";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.type !== "user") {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(payload.sub);
    if (!user || user.is_deleted) {
      return Response.json({ error: "غير موجود" }, { status: 404 });
    }

    if (user.account_type !== "client") {
      return Response.json({ error: "فقط العملاء الرئيسيون يمكنهم إدارة الفريق" }, { status: 403 });
    }

    const members = await User.find({
      _id: { $in: user.team_members || [] },
      is_deleted: { $ne: true },
    })
      .select("username email full_name is_active created_at last_login hardware_hash")
      .lean();

    return Response.json({
      team: members.map((m: any) => ({
        id: m._id.toString(),
        username: m.username,
        email: m.email,
        full_name: m.full_name,
        is_active: m.is_active,
        created_at: m.created_at,
        last_login: m.last_login,
        has_device_binding: !!m.hardware_hash,
      })),
      max_team_members: user.max_team_members || 0,
      used: (user.team_members || []).length,
    });
  } catch (error) {
    console.error("Team list error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.type !== "user") {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = checkRateLimit(`team:${payload.sub}`, "api:team-create");
  if (!rl.allowed) return getRateLimitResponse(rl.resetIn);

  try {
    await connectDB();
    const owner = await User.findById(payload.sub);
    if (!owner || owner.is_deleted) {
      return Response.json({ error: "غير موجود" }, { status: 404 });
    }

    if (owner.account_type !== "client") {
      return Response.json({ error: "فقط العملاء الرئيسيون يمكنهم إضافة أعضاء فريق" }, { status: 403 });
    }

    if ((owner.team_members || []).length >= (owner.max_team_members || 0)) {
      return Response.json({ error: "لقد وصلت للحد الأقصى من أعضاء الفريق" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = createTeamSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { username, email, phone, password, full_name } = parsed.data;

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

    const teamMember = await User.create({
      username,
      username_key: username.toLowerCase(),
      email: email.toLowerCase(),
      email_verified: false,
      password_hash: hashPassword(password),
      full_name,
      phone: phone || null,
      role: "sub_user",
      account_type: "sub_user",
      owner_id: owner._id,
      serial_number: null,
      max_team_members: 0,
      is_active: true,
      activation: {
        status: owner.activation?.status || "active",
        max_devices: 1,
        subscription: {
          plan: owner.activation?.subscription?.plan || "trial",
          start_date: now,
          end_date: owner.activation?.subscription?.end_date || null,
          auto_renew: false,
          grace_period_end: owner.activation?.subscription?.grace_period_end || null,
        },
      },
      created_at: now,
      last_modified: now,
      sync_status: "synced",
    });

    await User.updateOne(
      { _id: owner._id },
      { $push: { team_members: teamMember._id } }
    );

    await writeAuditLog({
      target_collection: "users",
      action: "client_add_team_member",
      target_id: teamMember._id.toString(),
      target_username: username,
      performed_by: owner.email,
      performed_by_type: "user",
      actor_role: "client",
      details: { added_by: owner.email },
      success: true,
    });

    return Response.json({
      message: "تم إضافة عضو الفريق بنجاح",
      member: {
        id: teamMember._id.toString(),
        username: teamMember.username,
        email: teamMember.email,
        full_name: teamMember.full_name,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Team create error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
