import { describe, it, expect, vi } from "vitest";
import {
  hashPassword,
  verifyPassword,
  rehashIfNeeded,
  signAccessToken,
  signRefreshToken,
  verifyToken,
  isFounder,
  isAdmin,
  hashToken,
  generateToken,
  generateSecurePassword,
  JwtPayload,
} from "@/lib/auth";

describe("hashPassword", () => {
  it("should return salt:hash format", () => {
    const result = hashPassword("testPassword123");
    const parts = result.split(":");
    expect(parts.length).toBe(2);
    expect(parts[0].length).toBe(32);
    expect(parts[1].length).toBe(64);
  });

  it("should produce different hashes for same password", () => {
    const hash1 = hashPassword("samePassword123");
    const hash2 = hashPassword("samePassword123");
    expect(hash1).not.toBe(hash2);
  });
});

describe("verifyPassword", () => {
  it("should verify correct password (600k iterations)", () => {
    const hash = hashPassword("testPassword123");
    expect(verifyPassword("testPassword123", hash)).toBe(true);
  });

  it("should reject wrong password", () => {
    const hash = hashPassword("testPassword123");
    expect(verifyPassword("wrongPassword", hash)).toBe(false);
  });

  it("should reject null hash", () => {
    expect(verifyPassword("test", "")).toBe(false);
    expect(verifyPassword("test", null as any)).toBe(false);
  });

  it("should reject hash without colon", () => {
    expect(verifyPassword("test", "noColonHere")).toBe(false);
  });

  it("should verify legacy hash (100k iterations)", () => {
    const crypto = require("crypto");
    const salt = crypto.randomBytes(16).toString("hex");
    const legacyHash = crypto
      .pbkdf2Sync("legacyPassword", salt, 100000, 32, "sha256")
      .toString("hex");
    const stored = `${salt}:${legacyHash}`;

    expect(verifyPassword("legacyPassword", stored)).toBe(true);
  });
});

describe("rehashIfNeeded", () => {
  it("should rehash legacy password", () => {
    const crypto = require("crypto");
    const salt = crypto.randomBytes(16).toString("hex");
    const legacyHash = crypto
      .pbkdf2Sync("legacyPassword", salt, 100000, 32, "sha256")
      .toString("hex");
    const stored = `${salt}:${legacyHash}`;

    const newHash = rehashIfNeeded("legacyPassword", stored);
    expect(newHash).not.toBeNull();
    expect(newHash!.split(":").length).toBe(2);

    expect(verifyPassword("legacyPassword", newHash!)).toBe(true);
  });

  it("should return null for current-iteration password", () => {
    const stored = hashPassword("currentPassword123");
    const result = rehashIfNeeded("currentPassword123", stored);
    expect(result).toBeNull();
  });

  it("should return null for invalid hash", () => {
    const result = rehashIfNeeded("test", "invalid");
    expect(result).toBeNull();
  });
});

describe("JWT tokens", () => {
  const testPayload: JwtPayload = {
    sub: "user123",
    type: "user",
    email: "test@example.com",
  };

  it("should sign and verify access token", () => {
    const token = signAccessToken(testPayload);
    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.sub).toBe("user123");
    expect(decoded!.type).toBe("user");
  });

  it("should sign and verify refresh token", () => {
    const token = signRefreshToken(testPayload);
    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.sub).toBe("user123");
    expect((decoded as any).jti).toBeDefined();
  });

  it("should return null for invalid token", () => {
    const decoded = verifyToken("invalid.token.here");
    expect(decoded).toBeNull();
  });

  it("should return null for expired token", () => {
    const jwt = require("jsonwebtoken");
    const expiredToken = jwt.sign(
      { sub: "user123", type: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "-1s" }
    );
    const decoded = verifyToken(expiredToken);
    expect(decoded).toBeNull();
  });

  it("should include role in token", () => {
    const payload: JwtPayload = {
      sub: "admin123",
      type: "admin",
      role: "founder",
    };
    const token = signAccessToken(payload);
    const decoded = verifyToken(token);
    expect(decoded!.role).toBe("founder");
  });

  it("should include organization_id in token", () => {
    const payload: JwtPayload = {
      sub: "user123",
      type: "user",
      organization_id: "org123",
    };
    const token = signAccessToken(payload);
    const decoded = verifyToken(token);
    expect(decoded!.organization_id).toBe("org123");
  });
});

describe("isFounder", () => {
  it("should return true for founder", () => {
    expect(isFounder({ sub: "1", type: "admin", role: "founder" })).toBe(true);
  });

  it("should return false for admin", () => {
    expect(isFounder({ sub: "1", type: "admin", role: "admin" })).toBe(false);
  });

  it("should return false for user", () => {
    expect(isFounder({ sub: "1", type: "user" })).toBe(false);
  });

  it("should return false for null", () => {
    expect(isFounder(null)).toBe(false);
  });
});

describe("isAdmin", () => {
  it("should return true for founder", () => {
    expect(isAdmin({ sub: "1", type: "admin", role: "founder" })).toBe(true);
  });

  it("should return true for super_admin", () => {
    expect(isAdmin({ sub: "1", type: "admin", role: "super_admin" })).toBe(true);
  });

  it("should return true for admin", () => {
    expect(isAdmin({ sub: "1", type: "admin", role: "admin" })).toBe(true);
  });

  it("should return true for support", () => {
    expect(isAdmin({ sub: "1", type: "admin", role: "support" })).toBe(true);
  });

  it("should return false for user type", () => {
    expect(isAdmin({ sub: "1", type: "user" })).toBe(false);
  });

  it("should return false for null", () => {
    expect(isAdmin(null)).toBe(false);
  });
});

describe("hashToken", () => {
  it("should return SHA-256 hex hash", () => {
    const result = hashToken("test-token");
    expect(result).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should produce consistent hash", () => {
    const hash1 = hashToken("same-token");
    const hash2 = hashToken("same-token");
    expect(hash1).toBe(hash2);
  });

  it("should produce different hash for different input", () => {
    const hash1 = hashToken("token-1");
    const hash2 = hashToken("token-2");
    expect(hash1).not.toBe(hash2);
  });
});

describe("generateToken", () => {
  it("should return UUID format", () => {
    const token = generateToken();
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it("should produce unique tokens", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateToken()));
    expect(tokens.size).toBe(100);
  });
});

describe("generateSecurePassword", () => {
  it("should return password of default length (16)", () => {
    const password = generateSecurePassword();
    expect(password.length).toBe(16);
  });

  it("should return password of specified length", () => {
    const password = generateSecurePassword(24);
    expect(password.length).toBe(24);
  });

  it("should contain characters from expected charset", () => {
    const password = generateSecurePassword(100);
    expect(/[a-z]/.test(password)).toBe(true);
    expect(/[A-Z]/.test(password)).toBe(true);
    expect(/[0-9]/.test(password)).toBe(true);
  });
});
