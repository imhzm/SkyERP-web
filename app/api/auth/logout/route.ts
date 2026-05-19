import { NextRequest } from "next/server";
import { verifyToken, hashToken, clearAuthCookies } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Admin } from "@/models/Admin";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value;
    const accessToken = request.cookies.get("access_token")?.value;

    if (refreshToken) {
      const payload = verifyToken(refreshToken);
      if (payload) {
        await connectDB();
        const tokenHash = hashToken(refreshToken);

        if (payload.type === "admin") {
          await Admin.updateOne(
            { _id: payload.sub },
            { $pull: { refresh_tokens: { token_hash: tokenHash } } }
          );
        } else {
          await User.updateOne(
            { _id: payload.sub },
            {
              $pull: { refresh_tokens: { token_hash: tokenHash } },
              $set: { sessions: [] },
            }
          );
        }
      }
    }

    await clearAuthCookies();

    return Response.json({ message: "تم تسجيل الخروج بنجاح" });
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
