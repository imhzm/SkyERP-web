import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  usernameSchema,
  phoneSchema,
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createAdminSchema,
  createTeamSchema,
  paginationSchema,
} from "@/lib/validation";

describe("emailSchema", () => {
  it("should accept valid email", () => {
    const result = emailSchema.safeParse("Test@Example.COM");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("test@example.com");
    }
  });

  it("should reject invalid email", () => {
    const result = emailSchema.safeParse("not-an-email");
    expect(result.success).toBe(false);
  });

  it("should reject empty string", () => {
    const result = emailSchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("should lowercase and transform email", () => {
    const result = emailSchema.safeParse("Test@Example.COM");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("test@example.com");
    }
  });

  it("should reject email exceeding 255 chars", () => {
    const longEmail = "a".repeat(250) + "@x.com";
    const result = emailSchema.safeParse(longEmail);
    expect(result.success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("should accept strong password", () => {
    const result = passwordSchema.safeParse("MyStr0ng!Password");
    expect(result.success).toBe(true);
  });

  it("should reject password shorter than 12 chars", () => {
    const result = passwordSchema.safeParse("Sh0rt!");
    expect(result.success).toBe(false);
  });

  it("should reject password without lowercase", () => {
    const result = passwordSchema.safeParse("ALLUPPER123!");
    expect(result.success).toBe(false);
  });

  it("should reject password without uppercase", () => {
    const result = passwordSchema.safeParse("alllower123!");
    expect(result.success).toBe(false);
  });

  it("should reject password without number", () => {
    const result = passwordSchema.safeParse("NoNumbers!!");
    expect(result.success).toBe(false);
  });

  it("should reject password without special char", () => {
    const result = passwordSchema.safeParse("NoSpecial123");
    expect(result.success).toBe(false);
  });

  it("should reject password exceeding 128 chars", () => {
    const result = passwordSchema.safeParse("A".repeat(129) + "1!");
    expect(result.success).toBe(false);
  });
});

describe("usernameSchema", () => {
  it("should accept valid username", () => {
    const result = usernameSchema.safeParse("user_name-123");
    expect(result.success).toBe(true);
  });

  it("should reject username shorter than 3 chars", () => {
    const result = usernameSchema.safeParse("ab");
    expect(result.success).toBe(false);
  });

  it("should reject username longer than 30 chars", () => {
    const result = usernameSchema.safeParse("a".repeat(31));
    expect(result.success).toBe(false);
  });

  it("should reject username with spaces", () => {
    const result = usernameSchema.safeParse("user name");
    expect(result.success).toBe(false);
  });

  it("should reject username with Arabic characters", () => {
    const result = usernameSchema.safeParse("مستخدم");
    expect(result.success).toBe(false);
  });
});

describe("phoneSchema", () => {
  it("should accept valid phone with country code", () => {
    const result = phoneSchema.safeParse("+201067894321");
    expect(result.success).toBe(true);
  });

  it("should accept phone without country code", () => {
    const result = phoneSchema.safeParse("01067894321");
    expect(result.success).toBe(true);
  });

  it("should accept null", () => {
    const result = phoneSchema.safeParse(null);
    expect(result.success).toBe(true);
  });

  it("should accept undefined", () => {
    const result = phoneSchema.safeParse(undefined);
    expect(result.success).toBe(true);
  });

  it("should reject too short phone", () => {
    const result = phoneSchema.safeParse("123456");
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("should accept valid login", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "anypassword",
    });
    expect(result.success).toBe(true);
  });

  it("should reject without password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid email", () => {
    const result = loginSchema.safeParse({
      email: "invalid",
      password: "pass",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const validPayload = {
    username: "testuser",
    email: "test@example.com",
    password: "MyStr0ng!Pass",
    confirm_password: "MyStr0ng!Pass",
  };

  it("should accept valid registration", () => {
    const result = registerSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("should reject mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...validPayload,
      confirm_password: "Different!Pass1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirm_password");
    }
  });

  it("should reject weak password", () => {
    const result = registerSchema.safeParse({
      ...validPayload,
      password: "weak",
      confirm_password: "weak",
    });
    expect(result.success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("should accept valid change", () => {
    const result = changePasswordSchema.safeParse({
      current_password: "oldPass",
      new_password: "MyStr0ng!Pass",
      confirm_password: "MyStr0ng!Pass",
    });
    expect(result.success).toBe(true);
  });

  it("should reject mismatched new passwords", () => {
    const result = changePasswordSchema.safeParse({
      current_password: "oldPass",
      new_password: "MyStr0ng!Pass",
      confirm_password: "Different!Pass1",
    });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("should accept valid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "invalid" });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("should accept valid reset", () => {
    const result = resetPasswordSchema.safeParse({
      token: "some-token",
      password: "MyStr0ng!Pass",
      confirm_password: "MyStr0ng!Pass",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty token", () => {
    const result = resetPasswordSchema.safeParse({
      token: "",
      password: "MyStr0ng!Pass",
      confirm_password: "MyStr0ng!Pass",
    });
    expect(result.success).toBe(false);
  });
});

describe("paginationSchema", () => {
  it("should apply defaults", () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sort_order).toBe("desc");
    }
  });

  it("should coerce string page to number", () => {
    const result = paginationSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });

  it("should reject limit > 100", () => {
    const result = paginationSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("should reject limit < 1", () => {
    const result = paginationSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });
});

describe("createAdminSchema", () => {
  it("should accept valid admin", () => {
    const result = createAdminSchema.safeParse({
      email: "admin@example.com",
      password: "securePass123",
      full_name: "Admin User",
    });
    expect(result.success).toBe(true);
  });

  it("should apply default role", () => {
    const result = createAdminSchema.safeParse({
      email: "admin@example.com",
      password: "securePass123",
      full_name: "Admin User",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("admin");
    }
  });

  it("should reject invalid role", () => {
    const result = createAdminSchema.safeParse({
      email: "admin@example.com",
      password: "securePass123",
      full_name: "Admin User",
      role: "invalid_role",
    });
    expect(result.success).toBe(false);
  });
});

describe("createTeamSchema", () => {
  it("should accept valid team member", () => {
    const result = createTeamSchema.safeParse({
      username: "teamuser",
      email: "team@example.com",
      password: "securePass123",
      full_name: "Team Member",
    });
    expect(result.success).toBe(true);
  });

  it("should reject without full_name", () => {
    const result = createTeamSchema.safeParse({
      username: "teamuser",
      email: "team@example.com",
      password: "securePass123",
    });
    expect(result.success).toBe(false);
  });
});
