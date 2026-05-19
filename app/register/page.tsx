"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const GOOGLE_ERRORS: Record<string, string> = {
  google_auth_cancelled: "تم إلغاء التسجيل بجوجل",
  google_auth_invalid: "فشل التحقق من التسجيل بجوجل",
  google_auth_failed: "حدث خطأ أثناء التسجيل بجوجل",
  google_email_not_verified: "يجب تأكيد بريدك الإلكتروني في جوجل أولاً",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#0A6CF1] border-t-transparent rounded-full animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err && GOOGLE_ERRORS[err]) {
      setError(GOOGLE_ERRORS[err]);
      window.history.replaceState({}, "", "/register");
    }
  }, [searchParams]);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        return;
      }

      setSuccess(
        data.email_verification_sent
          ? "تم التسجيل بنجاح! تم إرسال رابط التفعيل إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد."
          : "تم التسجيل بنجاح! يمكنك الآن تحميل البرنامج وتسجيل الدخول.",
      );
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  const passwordChecks = [
    { label: "12 حرفًا على الأقل", met: form.password.length >= 12 },
    { label: "حرف كبير", met: /[A-Z]/.test(form.password) },
    { label: "حرف صغير", met: /[a-z]/.test(form.password) },
    { label: "رقم", met: /[0-9]/.test(form.password) },
    { label: "رمز خاص", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password) },
  ];
  const passwordScore = passwordChecks.filter((c) => c.met).length;
  const passwordStrength = passwordScore <= 2 ? "ضعيفة" : passwordScore <= 4 ? "متوسطة" : "قوية";
  const strengthColor = passwordScore <= 2 ? "bg-red-500" : passwordScore <= 4 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">إنشاء حساب جديد</h1>
            <p className="text-gray-400 text-sm">اشترك الآن وابدأ فترة تجريبية مجانية لمدة 14 يومًا</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg px-4 py-3 mb-6 text-sm">
              {success}
              <div className="mt-3 flex gap-3">
                <Link href="/login" className="text-[#0A6CF1] hover:underline font-medium">
                  تسجيل الدخول ←
                </Link>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/auth/resend-verification", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: form.email }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setSuccess("تم إعادة إرسال رابط التفعيل إلى بريدك الإلكتروني");
                      } else {
                        setError(data.error || "فشل إعادة الإرسال");
                      }
                    } catch {
                      setError("حدث خطأ في الاتصال");
                    }
                  }}
                  className="text-gray-400 hover:text-white underline font-medium text-xs cursor-pointer"
                >
                  إعادة إرسال الرابط
                </button>
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">اسم المستخدم</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] transition"
                  placeholder="ahmed"
                  required
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] transition"
                  placeholder="ahmed@example.com"
                  required
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">رقم الهاتف (اختياري)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] transition"
                  placeholder="+201234567890"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">كلمة المرور</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] transition"
                  placeholder="••••••••"
                  required
                />
                {form.password.length > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${strengthColor} transition-all`} style={{ width: `${(passwordScore / 5) * 100}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">قوة كلمة المرور: {passwordStrength}</p>
                    <ul className="mt-2 space-y-1">
                      {passwordChecks.map((check) => (
                        <li key={check.label} className={`text-xs flex items-center gap-2 ${check.met ? "text-green-400" : "text-gray-500"}`}>
                          <span>{check.met ? "✓" : "○"}</span> {check.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={form.confirm_password}
                  onChange={(e) => updateField("confirm_password", e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0A6CF1] hover:bg-[#0955c4] disabled:opacity-50 text-white rounded-lg font-medium transition cursor-pointer mt-2"
              >
                {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-transparent text-gray-500">أو</span>
                </div>
              </div>

              <a
                href="/api/auth/google"
                className="w-full flex items-center justify-center gap-3 py-3 bg-white hover:bg-gray-100 text-gray-800 rounded-lg font-medium transition cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                التسجيل بجوجل
              </a>
            </form>
          )}

          <p className="text-center text-gray-400 text-sm mt-6">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-[#0A6CF1] hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
