"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function RegisterPage() {
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

      setSuccess("تم التسجيل بنجاح! يمكنك الآن تحميل البرنامج وتسجيل الدخول.");
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
              <div className="mt-3">
                <Link href="/download" className="text-[#0A6CF1] hover:underline font-medium">
                  تحميل البرنامج ←
                </Link>
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
