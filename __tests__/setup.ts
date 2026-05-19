import { beforeAll, afterAll, afterEach, vi } from "vitest";

process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-only";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/skywave-erp-test";
process.env.NEXT_PUBLIC_SITE_URL = "https://erp.skywaveads.com";

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    })
  ),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  NextResponse: {
    json: vi.fn(),
    redirect: vi.fn(),
  },
}));
