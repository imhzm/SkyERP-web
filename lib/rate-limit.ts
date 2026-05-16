const rateMap = new Map<string, { count: number; resetAt: number }>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

const limits: Record<string, RateLimitConfig> = {
  "auth:login": { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
  "auth:admin-login": { maxAttempts: 3, windowMs: 30 * 60 * 1000 },
  "auth:register": { maxAttempts: 2, windowMs: 60 * 60 * 1000 },
  "auth:forgot-password": { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
  "auth:verify-email": { maxAttempts: 5, windowMs: 60 * 60 * 1000 },
  "api:default": { maxAttempts: 100, windowMs: 60 * 1000 },
};

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of rateMap) {
    if (now > entry.resetAt) {
      rateMap.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  category: keyof typeof limits = "api:default"
): { allowed: boolean; remaining: number; resetIn: number } {
  cleanup();

  const config = limits[category] || limits["api:default"];
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxAttempts - 1, resetIn: config.windowMs };
  }

  entry.count++;

  if (entry.count > config.maxAttempts) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  return { allowed: true, remaining: config.maxAttempts - entry.count, resetIn: entry.resetAt - now };
}

export function resetRateLimit(key: string): void {
  rateMap.delete(key);
}

export function getRateLimitResponse(resetIn: number): Response {
  const retryAfter = Math.ceil(resetIn / 1000);
  return Response.json(
    {
      error: "طلبات كثيرة جدًا",
      message: `حاول مرة أخرى بعد ${Math.ceil(retryAfter / 60)} دقيقة`,
      retry_after_seconds: retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1000) + retryAfter),
      },
    }
  );
}
