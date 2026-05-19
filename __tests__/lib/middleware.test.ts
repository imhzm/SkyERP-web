import { describe, it, expect, vi } from "vitest";
import {
  getTokenFromRequest,
  requireAuth,
  requireAdmin,
  requireFounder,
} from "@/lib/middleware";
import { signAccessToken } from "@/lib/auth";
import { NextRequest } from "next/server";

function createMockRequest(options: {
  authHeader?: string;
  cookieToken?: string;
}): NextRequest {
  const headers = new Headers();
  if (options.authHeader) {
    headers.set("authorization", options.authHeader);
  }

  const cookies = new Map<string, { name: string; value: string }>();
  if (options.cookieToken) {
    cookies.set("access_token", {
      name: "access_token",
      value: options.cookieToken,
    });
  }

  return {
    headers,
    cookies: {
      get: (name: string) => cookies.get(name) || undefined,
    },
  } as unknown as NextRequest;
}

describe("getTokenFromRequest", () => {
  it("should extract token from Authorization header", () => {
    const token = signAccessToken({
      sub: "user123",
      type: "user",
      email: "test@example.com",
    });
    const req = createMockRequest({ authHeader: `Bearer ${token}` });
    const payload = getTokenFromRequest(req);

    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe("user123");
  });

  it("should extract token from cookie", () => {
    const token = signAccessToken({
      sub: "user456",
      type: "admin",
      role: "founder",
    });
    const req = createMockRequest({ cookieToken: token });
    const payload = getTokenFromRequest(req);

    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe("user456");
  });

  it("should prefer Authorization header over cookie", () => {
    const headerToken = signAccessToken({
      sub: "header-user",
      type: "user",
    });
    const cookieToken = signAccessToken({
      sub: "cookie-user",
      type: "user",
    });
    const req = createMockRequest({
      authHeader: `Bearer ${headerToken}`,
      cookieToken: cookieToken,
    });
    const payload = getTokenFromRequest(req);

    expect(payload!.sub).toBe("header-user");
  });

  it("should return null when no token present", () => {
    const req = createMockRequest({});
    const payload = getTokenFromRequest(req);
    expect(payload).toBeNull();
  });

  it("should return null for invalid token", () => {
    const req = createMockRequest({ authHeader: "Bearer invalid.token" });
    const payload = getTokenFromRequest(req);
    expect(payload).toBeNull();
  });
});

describe("requireAuth", () => {
  it("should return payload for valid user token", () => {
    const token = signAccessToken({
      sub: "user123",
      type: "user",
    });
    const req = createMockRequest({ authHeader: `Bearer ${token}` });
    const payload = requireAuth(req);

    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe("user123");
  });

  it("should return null for no token", () => {
    const req = createMockRequest({});
    expect(requireAuth(req)).toBeNull();
  });
});

describe("requireAdmin", () => {
  it("should return payload for founder", () => {
    const token = signAccessToken({
      sub: "admin1",
      type: "admin",
      role: "founder",
    });
    const req = createMockRequest({ authHeader: `Bearer ${token}` });
    expect(requireAdmin(req)).not.toBeNull();
  });

  it("should return payload for admin", () => {
    const token = signAccessToken({
      sub: "admin2",
      type: "admin",
      role: "admin",
    });
    const req = createMockRequest({ authHeader: `Bearer ${token}` });
    expect(requireAdmin(req)).not.toBeNull();
  });

  it("should return payload for support", () => {
    const token = signAccessToken({
      sub: "admin3",
      type: "admin",
      role: "support",
    });
    const req = createMockRequest({ authHeader: `Bearer ${token}` });
    expect(requireAdmin(req)).not.toBeNull();
  });

  it("should return null for regular user", () => {
    const token = signAccessToken({
      sub: "user1",
      type: "user",
    });
    const req = createMockRequest({ authHeader: `Bearer ${token}` });
    expect(requireAdmin(req)).toBeNull();
  });

  it("should return null for no token", () => {
    const req = createMockRequest({});
    expect(requireAdmin(req)).toBeNull();
  });
});

describe("requireFounder", () => {
  it("should return payload for founder only", () => {
    const token = signAccessToken({
      sub: "founder1",
      type: "admin",
      role: "founder",
    });
    const req = createMockRequest({ authHeader: `Bearer ${token}` });
    expect(requireFounder(req)).not.toBeNull();
  });

  it("should return null for super_admin", () => {
    const token = signAccessToken({
      sub: "admin1",
      type: "admin",
      role: "super_admin",
    });
    const req = createMockRequest({ authHeader: `Bearer ${token}` });
    expect(requireFounder(req)).toBeNull();
  });

  it("should return null for admin", () => {
    const token = signAccessToken({
      sub: "admin2",
      type: "admin",
      role: "admin",
    });
    const req = createMockRequest({ authHeader: `Bearer ${token}` });
    expect(requireFounder(req)).toBeNull();
  });

  it("should return null for support", () => {
    const token = signAccessToken({
      sub: "admin3",
      type: "admin",
      role: "support",
    });
    const req = createMockRequest({ authHeader: `Bearer ${token}` });
    expect(requireFounder(req)).toBeNull();
  });
});
