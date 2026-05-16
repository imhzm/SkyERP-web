import { NextRequest } from "next/server";
import { getTokenFromRequest } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

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
    return Response.json({
      user: {
        id: u._id.toString(),
        username: u.username,
        email: u.email,
        full_name: u.full_name,
        phone: u.phone,
        role: u.role,
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
