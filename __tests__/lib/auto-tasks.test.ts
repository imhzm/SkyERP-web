import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const connectDB = vi.fn();
const updateMany = vi.fn(() => Promise.resolve({ modifiedCount: 0 }));

vi.mock("@/lib/mongodb", () => ({ connectDB }));
vi.mock("@/models/billing/Invoice", () => ({ Invoice: { updateMany } }));
vi.mock("@/models/User", () => ({ User: { updateMany } }));
vi.mock("@/models/Organization", () => ({ Organization: { updateMany } }));

describe("internal auto tasks route", () => {
  beforeEach(() => {
    vi.resetModules();
    connectDB.mockClear();
    updateMany.mockClear();
    delete process.env.INTERNAL_TASK_SECRET;
    delete process.env.CRON_SECRET;
  });

  afterEach(() => {
    delete process.env.INTERNAL_TASK_SECRET;
    delete process.env.CRON_SECRET;
  });

  it("rejects requests when no internal secret is configured", async () => {
    const { POST } = await import("@/app/api/internal/auto-tasks/route");

    const response = await POST(new Request("https://example.com/api/internal/auto-tasks"));

    expect(response.status).toBe(503);
    expect(connectDB).not.toHaveBeenCalled();
  });

  it("rejects requests with a missing or wrong secret", async () => {
    process.env.INTERNAL_TASK_SECRET = "expected-secret";
    const { POST } = await import("@/app/api/internal/auto-tasks/route");

    const response = await POST(
      new Request("https://example.com/api/internal/auto-tasks", {
        method: "POST",
        headers: { "x-internal-task-secret": "wrong-secret" },
      })
    );

    expect(response.status).toBe(403);
    expect(connectDB).not.toHaveBeenCalled();
  });
});
