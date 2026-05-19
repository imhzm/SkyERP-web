"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#0A6CF1] border-t-transparent rounded-full animate-spin" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("رمز التحقق مطلوب");
      return;
    }

    fetch(`/api/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
        } else if (data.expired) {
          setStatus("expired");
          setMessage(data.error);
          setEmail(data.email || "");
        } else {
          setStatus("error");
          setMessage(data.error || "فشل التحقق");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("حدث خطأ في الاتصال");
      });
  }, [token]);

  async function handleResend() {
    if (!email) return;
    setStatus("loading");
    setMessage("جاري إعادة الإرسال...");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("تم إرسال رابط التحقق الجديد إلى بريدك");
      } else {
        setStatus("error");
        setMessage(data.error || "فشل إعادة الإرسال");
      }
    } catch {
      setStatus("error");
      setMessage("حدث خطأ في الاتصال");
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl text-center">
          {status === "loading" && (
            <div>
              <div className="w-12 h-12 border-4 border-[#0A6CF1] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-300">{message || "جاري التحقق..."}</p>
            </div>
          )}

          {status === "success" && (
            <div>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">تم التأكيد بنجاح</h1>
              <p className="text-gray-400 mb-6">{message}</p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-[#0A6CF1] hover:bg-[#0955c4] text-white rounded-lg font-medium transition"
              >
                تسجيل الدخول
              </Link>
            </div>
          )}

          {status === "expired" && (
            <div>
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">انتهت صلاحية الرابط</h1>
              <p className="text-gray-400 mb-6">{message}</p>
              <button
                onClick={handleResend}
                className="px-6 py-3 bg-[#0A6CF1] hover:bg-[#0955c4] text-white rounded-lg font-medium transition cursor-pointer"
              >
                إعادة إرسال رابط التحقق
              </button>
            </div>
          )}

          {status === "error" && (
            <div>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">فشل التحقق</h1>
              <p className="text-gray-400 mb-6">{message}</p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-[#0A6CF1] hover:bg-[#0955c4] text-white rounded-lg font-medium transition"
              >
                العودة لتسجيل الدخول
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
