import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl, generateState } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  try {
    const state = generateState();
    const authUrl = getGoogleAuthUrl(state);

    const referer = request.headers.get("referer") || "";
    const origin = referer.includes("/register") ? "register" : "login";

    const response = NextResponse.redirect(authUrl);
    response.cookies.set("google_oauth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    response.cookies.set("google_oauth_origin", origin, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google OAuth init error:", error);
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url));
  }
}
