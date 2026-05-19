import nodemailer from "nodemailer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://erp.skywaveads.com";
const FROM_NAME = process.env.SMTP_FROM_NAME || "Sky ERP";
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || "";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

interface EmailResult {
  success: boolean;
  error?: string;
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function getFromAddress(): string {
  return FROM_EMAIL ? `${FROM_NAME} <${FROM_EMAIL}>` : FROM_NAME;
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("sendEmail: SMTP_USER or SMTP_PASS not configured");
    return { success: false, error: "SMTP not configured" };
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: getFromAddress(),
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    });
    return { success: true };
  } catch (err) {
    console.error("sendEmail error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function verifySmtpConnection(): Promise<EmailResult> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

function baseHtml(content: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Segoe UI',Tahoma,sans-serif">
<table role="presentation" style="width:100%;max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
<tr><td style="background:#0A6CF1;padding:24px;text-align:center">
<h1 style="margin:0;color:#fff;font-size:22px">Sky ERP</h1>
</td></tr>
<tr><td style="padding:32px 24px">${content}</td></tr>
<tr><td style="background:#f9f9f9;padding:16px;text-align:center;color:#888;font-size:12px">
<p style="margin:0">© ${new Date().getFullYear()} Sky ERP. جميع الحقوق محفوظة.</p>
</td></tr>
</table>
</body>
</html>`;
}

function ctaButton(link: string, text: string): string {
  return `<table role="presentation" style="margin:24px 0"><tr><td style="background:#0A6CF1;border-radius:8px;padding:12px 24px">
<a href="${link}" style="color:#fff;text-decoration:none;font-size:16px;font-weight:600;display:inline-block">${text}</a>
</td></tr></table>`;
}

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<EmailResult> {
  const link = `${SITE_URL}/verify-email?token=${encodeURIComponent(token)}`;
  const html = baseHtml(`
<h2 style="margin:0 0 16px;color:#333;font-size:20px">تأكيد البريد الإلكتروني</h2>
<p style="margin:0 0 12px;color:#555;line-height:1.7">شكراً لتسجيلك في Sky ERP. يرجى تأكيد بريدك الإلكتروني بالنقر على الرابط أدناه:</p>
${ctaButton(link, "تأكيد البريد الإلكتروني")}
<p style="margin:0;color:#999;font-size:13px">إذا لم تطلب هذا، يمكنك تجاهل هذه الرسالة.</p>
<p style="margin:8px 0 0;color:#999;font-size:13px">الرابط صالح لمدة 24 ساعة.</p>
`);
  return sendEmail({ to: email, subject: "تأكيد البريد الإلكتروني - Sky ERP", html });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<EmailResult> {
  const link = `${SITE_URL}/reset-password?token=${encodeURIComponent(token)}`;
  const html = baseHtml(`
<h2 style="margin:0 0 16px;color:#333;font-size:20px">إعادة تعيين كلمة المرور</h2>
<p style="margin:0 0 12px;color:#555;line-height:1.7">لقد تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك في Sky ERP. يمكنك إعادة تعيينها بالنقر على الرابط أدناه:</p>
${ctaButton(link, "إعادة تعيين كلمة المرور")}
<p style="margin:0;color:#999;font-size:13px">إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة.</p>
<p style="margin:8px 0 0;color:#999;font-size:13px">الرابط صالح لمدة ساعة واحدة.</p>
`);
  return sendEmail({ to: email, subject: "إعادة تعيين كلمة المرور - Sky ERP", html });
}

export async function sendWelcomeEmail(
  email: string,
  username: string,
): Promise<EmailResult> {
  const dashboardLink = `${SITE_URL}/dashboard`;
  const html = baseHtml(`
<h2 style="margin:0 0 16px;color:#333;font-size:20px">مرحبًا بك في Sky ERP!</h2>
<p style="margin:0 0 12px;color:#555;line-height:1.7">مرحبًا <strong>${username}</strong>، شكرًا لإنشاء حسابك في Sky ERP.</p>
<p style="margin:0 0 12px;color:#555;line-height:1.7">يمنحك حسابك فترة تجريبية مجانية لمدة 14 يومًا لاستكشاف جميع الميزات.</p>
${ctaButton(dashboardLink, "الذهاب إلى لوحة التحكم")}
<p style="margin:0;color:#999;font-size:13px">إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذه الرسالة.</p>
`);
  return sendEmail({ to: email, subject: "مرحبًا بك في Sky ERP!", html });
}

export async function sendSubscriptionExpiryWarning(
  email: string,
  daysLeft: number,
  planName: string,
): Promise<EmailResult> {
  const pricingLink = `${SITE_URL}/pricing`;
  const html = baseHtml(`
<h2 style="margin:0 0 16px;color:#333;font-size:20px">تنبيه: اشتراكك على وشك الانتهاء</h2>
<p style="margin:0 0 12px;color:#555;line-height:1.7">متبقي <strong style="color:#e53e3e">${daysLeft} يوم${daysLeft > 1 ? "ًا" : ""}</strong> على انتهاء اشتراكك في خطة <strong>${planName}</strong>.</p>
<p style="margin:0 0 12px;color:#555;line-height:1.7">قم بتجديد اشتراكك الآن لضمان استمرارية الوصول إلى جميع الميزات.</p>
${ctaButton(pricingLink, "تجديد الاشتراك")}
<p style="margin:0;color:#999;font-size:13px">بعد انتهاء الاشتراك، سيتم منحك فترة سماح إضافية قبل تعليق الحساب.</p>
`);
  return sendEmail({
    to: email,
    subject: `تنبيه: متبقي ${daysLeft} يوم على انتهاء اشتراكك - Sky ERP`,
    html,
  });
}

export async function sendSecurityAlertEmail(
  email: string,
  event: "password_change" | "device_change" | "account_lock",
  details: { ip?: string; device?: string; timestamp?: Date },
): Promise<EmailResult> {
  const eventMessages: Record<string, { title: string; body: string }> = {
    password_change: {
      title: "تم تغيير كلمة المرور",
      body: "تم تغيير كلمة مرور حسابك بنجاح.",
    },
    device_change: {
      title: "تسجيل دخول من جهاز جديد",
      body: `تم تسجيل الدخول إلى حسابك من جهاز جديد${details.device ? ` (${details.device})` : ""}.`,
    },
    account_lock: {
      title: "تم قفل حسابك",
      body: "تم قفل حسابك بسبب محاولات تسجيل دخول فاشلة متعددة.",
    },
  };

  const { title, body } = eventMessages[event] || {
    title: "تنبيه أمني",
    body: "تم رصد نشاط على حسابك.",
  };

  const loginLink = `${SITE_URL}/login`;
  const html = baseHtml(`
<h2 style="margin:0 0 16px;color:#333;font-size:20px">${title}</h2>
<p style="margin:0 0 12px;color:#555;line-height:1.7">${body}</p>
${details.ip ? `<p style="margin:0 0 8px;color:#777;font-size:13px">عنوان IP: <code style="background:#f0f0f0;padding:2px 6px;border-radius:4px">${details.ip}</code></p>` : ""}
${details.timestamp ? `<p style="margin:0 0 8px;color:#777;font-size:13px">الوقت: ${details.timestamp.toLocaleString("ar-EG")}</p>` : ""}
<p style="margin:16px 0 0;color:#e53e3e;font-size:14px;font-weight:600">إذا لم تكن أنت من قام بهذا الإجراء، يرجى تغيير كلمة المرور فورًا.</p>
${ctaButton(loginLink, "تسجيل الدخول")}
`);
  return sendEmail({
    to: email,
    subject: `${title} - Sky ERP`,
    html,
  });
}

export async function sendInvoiceEmail(
  email: string,
  invoiceNumber: string,
  amount: number,
  currency: string,
  dueDate: Date,
  pdfBuffer?: Buffer,
): Promise<EmailResult> {
  const dashboardLink = `${SITE_URL}/dashboard`;
  const html = baseHtml(`
<h2 style="margin:0 0 16px;color:#333;font-size:20px">فاتورة جديدة</h2>
<p style="margin:0 0 12px;color:#555;line-height:1.7">تم إصدار فاتورة جديدة لحسابك:</p>
<table role="presentation" style="width:100%;border-collapse:collapse;margin:16px 0">
<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#777">رقم الفاتورة</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${invoiceNumber}</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#777">المبلغ</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${amount.toLocaleString("ar-EG")} ${currency}</td></tr>
<tr><td style="padding:8px 12px;color:#777">تاريخ الاستحقاق</td><td style="padding:8px 12px;font-weight:600">${dueDate.toLocaleDateString("ar-EG")}</td></tr>
</table>
${ctaButton(dashboardLink, "عرض الفاتورة")}
<p style="margin:0;color:#999;font-size:13px">شكرًا لاختيارك Sky ERP.</p>
`);

  const attachments = pdfBuffer
    ? [{ filename: `${invoiceNumber}.pdf`, content: pdfBuffer, contentType: "application/pdf" }]
    : undefined;

  return sendEmail({
    to: email,
    subject: `فاتورة ${invoiceNumber} - Sky ERP`,
    html,
    attachments,
  });
}
