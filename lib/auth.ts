import crypto from "crypto";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString("hex");
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

// PBKDF2-SHA256 matching the desktop app
const PBKDF2_ITERATIONS = 600000;
const PBKDF2_LEGACY_ITERATIONS = 100000;
const PBKDF2_KEY_LENGTH = 32;
const PBKDF2_DIGEST = "sha256";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEY_LENGTH,
    PBKDF2_DIGEST
  ).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) {
    return false;
  }

  const [salt, hash] = storedHash.split(":");

  // Try current iterations first
  const computedHash = crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEY_LENGTH,
    PBKDF2_DIGEST
  ).toString("hex");

  if (computedHash === hash) {
    return true;
  }

  // Fallback to legacy iterations (for users created by older desktop app)
  const legacyHash = crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_LEGACY_ITERATIONS,
    PBKDF2_KEY_LENGTH,
    PBKDF2_DIGEST
  ).toString("hex");

  return legacyHash === hash;
}

export function rehashIfNeeded(password: string, storedHash: string): string | null {
  const [salt, hash] = storedHash.split(":");
  const legacyHash = crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_LEGACY_ITERATIONS,
    PBKDF2_KEY_LENGTH,
    PBKDF2_DIGEST
  ).toString("hex");

  if (legacyHash === hash) {
    return hashPassword(password);
  }

  const currentHash = crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEY_LENGTH,
    PBKDF2_DIGEST
  ).toString("hex");

  if (currentHash === hash) {
    return null;
  }

  return null;
}

export interface JwtPayload {
  sub: string;
  type: "user" | "admin";
  role?: string;
  email?: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function isFounder(payload: JwtPayload | null): boolean {
  return payload?.type === "admin" && payload?.role === "founder";
}

export function isAdmin(payload: JwtPayload | null): boolean {
  return payload?.type === "admin" && (payload?.role === "founder" || payload?.role === "super_admin" || payload?.role === "admin" || payload?.role === "support");
}

export function requireFounder(payload: JwtPayload | null): payload is JwtPayload {
  return isFounder(payload);
}

export function requireAdminOrFounder(payload: JwtPayload | null): payload is JwtPayload {
  return isAdmin(payload);
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60,
  });

  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

export function generateToken(): string {
  return crypto.randomUUID();
}

export function generateSecurePassword(length = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  return Array.from(crypto.randomBytes(length))
    .map((b) => chars[b % chars.length])
    .join("");
}
