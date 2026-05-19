import { describe, it, expect } from "vitest";
import { toAuditRole, AuditRole } from "@/lib/audit";

describe("toAuditRole", () => {
  it("should return valid roles", () => {
    expect(toAuditRole("founder")).toBe("founder");
    expect(toAuditRole("super_admin")).toBe("super_admin");
    expect(toAuditRole("admin")).toBe("admin");
    expect(toAuditRole("support")).toBe("support");
    expect(toAuditRole("client")).toBe("client");
    expect(toAuditRole("sub_user")).toBe("sub_user");
  });

  it("should return null for undefined", () => {
    expect(toAuditRole(undefined)).toBe(null);
  });

  it("should cast unknown roles through", () => {
    expect(toAuditRole("unknown_role")).toBe("unknown_role");
  });
});
