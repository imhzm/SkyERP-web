import { verifyToken, JwtPayload, isAdmin, isFounder } from "./auth";
import { NextRequest } from "next/server";

export function getTokenFromRequest(request: NextRequest): JwtPayload | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return verifyToken(token);
  }

  const accessToken = request.cookies.get("access_token")?.value;
  if (accessToken) {
    return verifyToken(accessToken);
  }

  return null;
}

export function requireAuth(request: NextRequest): JwtPayload | null {
  const payload = getTokenFromRequest(request);
  if (!payload) {
    return null;
  }
  return payload;
}

export function requireAdmin(request: NextRequest): JwtPayload | null {
  const payload = getTokenFromRequest(request);
  if (!payload || !isAdmin(payload)) {
    return null;
  }
  return payload;
}

export function requireFounder(request: NextRequest): JwtPayload | null {
  const payload = getTokenFromRequest(request);
  if (!payload || !isFounder(payload)) {
    return null;
  }
  return payload;
}

export function requireAdminOrFounder(request: NextRequest): JwtPayload | null {
  const payload = getTokenFromRequest(request);
  if (!payload || !isAdmin(payload)) {
    return null;
  }
  return payload;
}
