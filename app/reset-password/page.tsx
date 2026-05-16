"use client";

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirm_password: confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        return;
      }

      setSuccess("تم إعادة تعيين كلمة المرور بنجاح");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return <p className="text-red-400 text-center">رابط غير صالح</p>;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">إعادة تعيين كلمة المرور</h1>

          {error && <div className="bg-red-500/10 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">{error}</div>}
          {success && <div className="bg-green-500/10 text-green-400 rounded-lg px-4 py-3 mb-6 text-sm">{success}</div>}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">كلمة المرور الجديدة</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0A6CF1] transition"
                  placeholder="••••••••" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">تأكيد كلمة المرور</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0A6CF1] transition"
                  placeholder="••••••••" required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-[#0A6CF1] hover:bg-[#0955c4] disabled:opacity-50 text-white rounded-lg font-medium transition cursor-pointer">
                {loading ? "جاري..." : "إعادة التعيين"}
              </button>
            </form>
          )}

          <p className="text-center text-gray-400 text-sm mt-6">
            <Link href="/login" className="text-[#0A6CF1] hover:underline">العودة لتسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">جاري التحميل...</div>}>
      <ResetForm />
    </Suspense>
  );
}
