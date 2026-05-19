export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

function getGoogleCredentials() {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!client_id || !client_secret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set");
  }
  return { client_id, client_secret };
}

export function getGoogleAuthUrl(state: string): string {
  const { client_id } = getGoogleCredentials();
  const redirect_uri = `${process.env.NEXT_PUBLIC_SITE_URL || "https://erp.skywaveads.com"}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    response_type: "code",
    scope: "openid email profile",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<{ access_token: string; id_token: string }> {
  const { client_id, client_secret } = getGoogleCredentials();
  const redirect_uri = `${process.env.NEXT_PUBLIC_SITE_URL || "https://erp.skywaveads.com"}/api/auth/google/callback`;

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id,
      client_secret,
      redirect_uri,
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Google token exchange failed:", err);
    throw new Error("Failed to exchange authorization code");
  }

  const data = await res.json();
  return {
    access_token: data.access_token,
    id_token: data.id_token,
  };
}

export async function getGoogleUserInfo(access_token: string): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Google user info");
  }

  return res.json();
}

export function generateState(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
