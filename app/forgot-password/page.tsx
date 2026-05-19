"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (sent) return;
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || data.error || "حدث خطأ");
      if (res.ok) setSent(true);
    } catch {
      setMessage("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">نسيت كلمة المرور</h1>
          <p className="text-gray-400 text-sm text-center mb-8">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>

          {message && (
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg px-4 py-3 mb-6 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] transition"
                placeholder="your@email.com"
                required
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading || sent}
              className="w-full py-3 bg-[#0A6CF1] hover:bg-[#0955c4] disabled:opacity-50 text-white rounded-lg font-medium transition cursor-pointer"
            >
              {loading ? "جاري الإرسال..." : sent ? "تم الإرسال" : "إرسال رابط إعادة التعيين"}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            <Link href="/login" className="text-[#0A6CF1] hover:underline">العودة لتسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
