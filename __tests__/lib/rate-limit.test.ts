import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimit, getRateLimitResponse, setRateLimitStore, MemoryRateLimitStore } from "@/lib/rate-limit";
import type { RateLimitStore } from "@/lib/rate-limit";

describe("checkRateLimit (memory store)", () => {
  beforeEach(async () => {
    setRateLimitStore(new MemoryRateLimitStore());
    await resetRateLimit("test-key");
    await resetRateLimit("test-key-2");
  });

  it("should allow first request", async () => {
    const result = await checkRateLimit("test-key", "auth:login");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.resetIn).toBeGreaterThan(0);
  });

  it("should count down remaining requests", async () => {
    await checkRateLimit("test-key", "auth:login");
    await checkRateLimit("test-key", "auth:login");
    const result = await checkRateLimit("test-key", "auth:login");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("should block requests after max attempts", async () => {
    for (let i = 0; i < 5; i++) {
      await checkRateLimit("test-key", "auth:login");
    }
    const result = await checkRateLimit("test-key", "auth:login");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should isolate keys from each other", async () => {
    for (let i = 0; i < 5; i++) {
      await checkRateLimit("test-key", "auth:login");
    }
    const result = await checkRateLimit("test-key-2", "auth:login");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("should use default bucket for unknown categories", async () => {
    const result = await checkRateLimit("test-key", "api:default");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(99);
  });

  it("should respect different bucket limits", async () => {
    const result = await checkRateLimit("test-key", "auth:register");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("should use api:default as fallback for invalid category", async () => {
    const result = await checkRateLimit("test-key", "nonexistent" as any);
    expect(result.allowed).toBe(true);
  });
});

describe("resetRateLimit", () => {
  beforeEach(async () => {
    setRateLimitStore(new MemoryRateLimitStore());
  });

  it("should reset rate limit for a key", async () => {
    for (let i = 0; i < 5; i++) {
      await checkRateLimit("test-key", "auth:login");
    }
    expect((await checkRateLimit("test-key", "auth:login")).allowed).toBe(false);

    await resetRateLimit("test-key");

    const result = await checkRateLimit("test-key", "auth:login");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });
});

describe("custom store adapter", () => {
  it("should work with a custom store implementation", async () => {
    const customMap = new Map<string, { count: number; resetAt: number }>();
    const customStore: RateLimitStore = {
      get: async (key) => customMap.get(key) || null,
      set: async (key, value) => { customMap.set(key, value); },
      delete: async (key) => { customMap.delete(key); },
    };

    setRateLimitStore(customStore);

    const result = await checkRateLimit("custom-key", "auth:login");
    expect(result.allowed).toBe(true);

    const stored = customMap.get("custom-key");
    expect(stored).toBeDefined();
    expect(stored!.count).toBe(1);

    setRateLimitStore(new MemoryRateLimitStore());
  });
});

describe("getRateLimitResponse", () => {
  it("should return 429 response with correct headers", () => {
    const response = getRateLimitResponse(90_000);
    expect(response.status).toBe(429);

    const headers = response.headers;
    expect(headers.get("Retry-After")).toBe("90");
  });

  it("should return JSON body with Arabic error message", async () => {
    const response = getRateLimitResponse(60_000);
    const body = await response.json();
    expect(body.error).toBeDefined();
    expect(body.retry_after_seconds).toBe(60);
  });
});
