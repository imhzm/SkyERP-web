import { describe, it, expect, vi, beforeEach } from "vitest";

const sendMailMock = vi.fn().mockResolvedValue({ messageId: "test-id" });

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: sendMailMock,
      verify: vi.fn().mockResolvedValue(true),
    })),
  },
}));

import nodemailer from "nodemailer";
import {
  sendEmail,
  verifySmtpConnection,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendSubscriptionExpiryWarning,
  sendSecurityAlertEmail,
  sendInvoiceEmail,
} from "@/lib/email";

describe("sendEmail", () => {
  beforeEach(() => {
    sendMailMock.mockClear();
    sendMailMock.mockResolvedValue({ messageId: "test-id" });
    process.env.SMTP_USER = "test@example.com";
    process.env.SMTP_PASS = "test-password";
  });

  it("should call createTransport with SMTP config", async () => {
    await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.gmail.com",
        port: 587,
      })
    );
  });

  it("should return success on valid send", async () => {
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });

    expect(result.success).toBe(true);
  });

  it("should return error on send failure", async () => {
    sendMailMock.mockRejectedValueOnce(new Error("SMTP error"));

    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("SMTP error");
  });

  it("should return error when SMTP not configured", async () => {
    delete process.env.SMTP_USER;
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("SMTP not configured");
    process.env.SMTP_USER = "test@example.com";
  });

  it("should pass attachments to sendMail", async () => {
    const buffer = Buffer.from("fake-pdf");
    await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Test</p>",
      attachments: [{ filename: "test.pdf", content: buffer, contentType: "application/pdf" }],
    });

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [{ filename: "test.pdf", content: buffer, contentType: "application/pdf" }],
      })
    );
  });
});

describe("verifySmtpConnection", () => {
  beforeEach(() => {
    sendMailMock.mockClear();
  });

  it("should return success on valid connection", async () => {
    const result = await verifySmtpConnection();
    expect(result.success).toBe(true);
  });
});

describe("sendVerificationEmail", () => {
  beforeEach(() => {
    sendMailMock.mockClear();
    sendMailMock.mockResolvedValue({ messageId: "test-id" });
  });

  it("should send email with verification link", async () => {
    const result = await sendVerificationEmail("test@example.com", "token123");

    expect(result.success).toBe(true);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        subject: expect.stringContaining("تأكيد"),
        html: expect.stringContaining("token123"),
      })
    );
  });

  it("should include SITE_URL in link", async () => {
    await sendVerificationEmail("test@example.com", "abc");

    const call = sendMailMock.mock.calls[0][0];
    expect(call.html).toContain("https://erp.skywaveads.com");
  });
});

describe("sendPasswordResetEmail", () => {
  beforeEach(() => {
    sendMailMock.mockClear();
    sendMailMock.mockResolvedValue({ messageId: "test-id" });
  });

  it("should send email with reset link", async () => {
    const result = await sendPasswordResetEmail("test@example.com", "reset-token");

    expect(result.success).toBe(true);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        subject: expect.stringContaining("إعادة تعيين"),
        html: expect.stringContaining("reset-token"),
      })
    );
  });
});

describe("sendWelcomeEmail", () => {
  beforeEach(() => {
    sendMailMock.mockClear();
    sendMailMock.mockResolvedValue({ messageId: "test-id" });
  });

  it("should send welcome email with username", async () => {
    const result = await sendWelcomeEmail("test@example.com", "testuser");

    expect(result.success).toBe(true);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        subject: expect.stringContaining("مرحبًا"),
        html: expect.stringContaining("testuser"),
      })
    );
  });

  it("should include dashboard link", async () => {
    await sendWelcomeEmail("test@example.com", "testuser");

    const call = sendMailMock.mock.calls[0][0];
    expect(call.html).toContain("/dashboard");
  });
});

describe("sendSubscriptionExpiryWarning", () => {
  beforeEach(() => {
    sendMailMock.mockClear();
    sendMailMock.mockResolvedValue({ messageId: "test-id" });
  });

  it("should send warning with days left", async () => {
    const result = await sendSubscriptionExpiryWarning("test@example.com", 3, "شهري");

    expect(result.success).toBe(true);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        html: expect.stringContaining("3"),
      })
    );
  });

  it("should include plan name", async () => {
    await sendSubscriptionExpiryWarning("test@example.com", 7, "سنوي");

    const call = sendMailMock.mock.calls[0][0];
    expect(call.html).toContain("سنوي");
  });
});

describe("sendSecurityAlertEmail", () => {
  beforeEach(() => {
    sendMailMock.mockClear();
    sendMailMock.mockResolvedValue({ messageId: "test-id" });
  });

  it("should send password change alert", async () => {
    const result = await sendSecurityAlertEmail("test@example.com", "password_change", {});

    expect(result.success).toBe(true);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining("تغيير كلمة المرور"),
      })
    );
  });

  it("should include IP in device change alert", async () => {
    await sendSecurityAlertEmail("test@example.com", "device_change", {
      ip: "192.168.1.1",
      device: "Chrome/Windows",
    });

    const call = sendMailMock.mock.calls[0][0];
    expect(call.html).toContain("192.168.1.1");
    expect(call.html).toContain("Chrome/Windows");
  });

  it("should send account lock alert", async () => {
    const result = await sendSecurityAlertEmail("test@example.com", "account_lock", {});

    expect(result.success).toBe(true);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining("قفل"),
      })
    );
  });
});

describe("sendInvoiceEmail", () => {
  beforeEach(() => {
    sendMailMock.mockClear();
    sendMailMock.mockResolvedValue({ messageId: "test-id" });
  });

  it("should send invoice email with details", async () => {
    const result = await sendInvoiceEmail(
      "test@example.com",
      "INV-202605-00001",
      500,
      "ج.م",
      new Date("2026-06-01")
    );

    expect(result.success).toBe(true);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        subject: expect.stringContaining("INV-202605-00001"),
        html: expect.stringContaining("INV-202605-00001"),
      })
    );
  });

  it("should attach PDF when provided", async () => {
    const pdfBuffer = Buffer.from("fake-pdf-content");

    await sendInvoiceEmail(
      "test@example.com",
      "INV-001",
      100,
      "ج.م",
      new Date(),
      pdfBuffer
    );

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [
          expect.objectContaining({
            filename: "INV-001.pdf",
            contentType: "application/pdf",
          }),
        ],
      })
    );
  });
});
