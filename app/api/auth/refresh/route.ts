import { NextRequest } from "next/server";
import { verifyToken, signAccessToken, signRefreshToken, hashToken, setAuthCookies, clearAuthCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Admin } from "@/models/Admin";
import { checkRateLimit, getRateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = await checkRateLimit(`refresh:${ip}`, "auth:refresh");
    if (!rl.allowed) return getRateLimitResponse(rl.resetIn);

    const refreshToken = request.cookies.get("refresh_token")?.value;
    if (!refreshToken) {
      return Response.json({ error: "غير مصرح" }, { status: 401 });
    }

    const payload = verifyToken(refreshToken);
    if (!payload) {
      await clearAuthCookies();
      return Response.json({ error: "انتهت الجلسة" }, { status: 401 });
    }

    const userAgent = request.headers.get("user-agent") || "";

    await connectDB();
    const tokenHash = hashToken(refreshToken);

    if (payload.type === "admin") {
      const admin = await Admin.findOne({
        _id: payload.sub,
        is_active: true,
        "refresh_tokens.token_hash": tokenHash,
      });
      if (!admin) {
        await clearAuthCookies();
        return Response.json({ error: "غير مصرح" }, { status: 401 });
      }

      const newAccess = signAccessToken({ sub: payload.sub, type: "admin", role: admin.role, email: admin.email });
      const newRefresh = signRefreshToken({ sub: payload.sub, type: "admin", email: admin.email });
      const newHash = hashToken(newRefresh);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await Admin.updateOne(
        { _id: payload.sub },
        {
          $pull: { refresh_tokens: { token_hash: tokenHash } },
          $push: { refresh_tokens: { token_hash: newHash, device_info: userAgent.slice(0, 200), ip, created_at: new Date(), expires_at: expiresAt } },
        }
      );

      await setAuthCookies(newAccess, newRefresh);
      return Response.json({ message: "تم تحديث الجلسة" });
    }

    const user = await User.findOne({
      _id: payload.sub,
      is_active: true,
      is_deleted: { $ne: true },
      "refresh_tokens.token_hash": tokenHash,
    });
    if (!user) {
      await clearAuthCookies();
      return Response.json({ error: "غير مصرح" }, { status: 401 });
    }

    const newAccess = signAccessToken({
      sub: payload.sub,
      type: "user",
      role: user.role,
      email: user.email,
      organization_id: user.organization_id?.toString() || undefined,
    });
    const newRefresh = signRefreshToken({
      sub: payload.sub,
      type: "user",
      email: user.email,
      organization_id: user.organization_id?.toString() || undefined,
    });
    const newHash = hashToken(newRefresh);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await User.updateOne(
      { _id: payload.sub },
      {
        $pull: { refresh_tokens: { token_hash: tokenHash } },
        $push: { refresh_tokens: { token_hash: newHash, device_info: userAgent.slice(0, 200), ip, created_at: new Date(), expires_at: expiresAt } },
      }
    );

    await setAuthCookies(newAccess, newRefresh);
    return Response.json({ message: "تم تحديث الجلسة" });
  } catch (error) {
    console.error("Refresh error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
