import { describe, it, expect, vi } from "vitest";

describe("instrumentation", () => {
  it("initializes the configured rate limit store", async () => {
    vi.resetModules();
    const initRateLimitStore = vi.fn();
    vi.doMock("@/lib/rate-limit", () => ({ initRateLimitStore }));

    const { register } = await import("../../instrumentation");
    await register();

    expect(initRateLimitStore).toHaveBeenCalledOnce();
  });
});
