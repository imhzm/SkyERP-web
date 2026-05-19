import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", false && "hidden", "active")).toBe("base active");
  });

  it("should merge tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("should handle undefined", () => {
    expect(cn("base", undefined)).toBe("base");
  });

  it("should handle empty input", () => {
    expect(cn()).toBe("");
  });
});
