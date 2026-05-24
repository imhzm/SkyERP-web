export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

export interface RateLimitStore {
  get(key: string): Promise<{ count: number; resetAt: number } | null>;
  set(key: string, value: { count: number; resetAt: number }, ttlMs: number): Promise<void>;
  delete(key: string): Promise<void>;
}

const limits: Record<string, RateLimitConfig> = {
  "auth:login": { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
  "auth:admin-login": { maxAttempts: 3, windowMs: 30 * 60 * 1000 },
  "auth:register": { maxAttempts: 2, windowMs: 60 * 60 * 1000 },
  "auth:forgot-password": { maxAttempts: 100, windowMs: 60 * 60 * 1000 },
  "auth:reset-password": { maxAttempts: 100, windowMs: 60 * 60 * 1000 },
  "auth:resend": { maxAttempts: 5, windowMs: 60 * 60 * 1000 },
  "auth:verify-email": { maxAttempts: 5, windowMs: 60 * 60 * 1000 },
  "auth:change-password": { maxAttempts: 3, windowMs: 15 * 60 * 1000 },
  "auth:google-callback": { maxAttempts: 5, windowMs: 10 * 60 * 1000 },
  "auth:refresh": { maxAttempts: 30, windowMs: 60 * 1000 },
  "api:default": { maxAttempts: 100, windowMs: 60 * 1000 },
  "api:team-create": { maxAttempts: 10, windowMs: 60 * 60 * 1000 },
  "api:user-invoices": { maxAttempts: 30, windowMs: 60 * 1000 },
  "api:admin-mutate": { maxAttempts: 30, windowMs: 60 * 1000 },
  "api:org-team-create": { maxAttempts: 10, windowMs: 60 * 60 * 1000 },
};

export function getLimits(): Record<string, RateLimitConfig> {
  return limits;
}

export { limits as rateLimitBuckets };

export class MemoryRateLimitStore implements RateLimitStore {
  private map = new Map<string, { count: number; resetAt: number }>();
  private lastCleanup = Date.now();
  private readonly CLEANUP_INTERVAL = 60_000;

  private cleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanup < this.CLEANUP_INTERVAL) return;
    this.lastCleanup = now;
    for (const [key, entry] of this.map) {
      if (now > entry.resetAt) {
        this.map.delete(key);
      }
    }
  }

  async get(key: string): Promise<{ count: number; resetAt: number } | null> {
    this.cleanup();
    const entry = this.map.get(key);
    if (!entry || Date.now() > entry.resetAt) {
      return null;
    }
    return entry;
  }

  async set(key: string, value: { count: number; resetAt: number }, _ttlMs: number): Promise<void> {
    this.map.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.map.delete(key);
  }
}

class RedisRateLimitStore implements RateLimitStore {
  private client: {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ...args: unknown[]): Promise<unknown>;
    del(key: string): Promise<number>;
  };

  constructor(client: RedisRateLimitStore["client"]) {
    this.client = client;
  }

  async get(key: string): Promise<{ count: number; resetAt: number } | null> {
    const raw = await this.client.get(`rl:${key}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (Date.now() > parsed.resetAt) {
        await this.client.del(`rl:${key}`);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  async set(key: string, value: { count: number; resetAt: number }, ttlMs: number): Promise<void> {
    const ttlSeconds = Math.ceil(ttlMs / 1000) + 1;
    await this.client.set(`rl:${key}`, JSON.stringify(value), "PX", ttlMs + 1000);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(`rl:${key}`);
  }
}

let store: RateLimitStore = new MemoryRateLimitStore();

export function setRateLimitStore(newStore: RateLimitStore): void {
  store = newStore;
}

export function initRateLimitStore(): void {
  if (process.env.REDIS_URL) {
    console.log("[rate-limit] Using Redis store:", process.env.REDIS_URL.replace(/\/\/.*@/, "//***@"));
    import("redis").then(({ createClient }) => {
      const client = createClient({ url: process.env.REDIS_URL });
      client.on("error", (err: Error) => console.error("[rate-limit] Redis error:", err));
      client.connect().then(() => {
        setRateLimitStore(new RedisRateLimitStore(client));
        console.log("[rate-limit] Redis connected");
      });
    }).catch((err: Error) => {
      console.error("[rate-limit] Failed to init Redis, falling back to memory:", err.message);
    });
  }
}

export async function checkRateLimit(
  key: string,
  category: keyof typeof limits = "api:default"
): Promise<RateLimitResult> {
  const config = limits[category] || limits["api:default"];
  const now = Date.now();

  const entry = await store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + config.windowMs;
    await store.set(key, { count: 1, resetAt }, config.windowMs);
    return { allowed: true, remaining: config.maxAttempts - 1, resetIn: config.windowMs };
  }

  entry.count++;

  if (entry.count > config.maxAttempts) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  await store.set(key, entry, entry.resetAt - now);

  return { allowed: true, remaining: config.maxAttempts - entry.count, resetIn: entry.resetAt - now };
}

export async function resetRateLimit(key: string): Promise<void> {
  await store.delete(key);
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
