import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function request(url = "https://example.com/api/ping") {
  return { url } as any;
}

describe("root middleware auto tasks", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(5 * 60 * 1000 + 1);
    process.env.INTERNAL_TASK_SECRET = "test-secret";
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response("{}"))));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    delete process.env.INTERNAL_TASK_SECRET;
  });

  it("resets in-flight state after auto task request settles", async () => {
    const { middleware } = await import("../middleware");

    await middleware(request());
    await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(1);

    vi.setSystemTime(10 * 60 * 1000 + 2);
    await middleware(request());
    await Promise.resolve();

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
