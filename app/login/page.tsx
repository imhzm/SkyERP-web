"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  Shield,
  Zap,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogIn,
} from "lucide-react";

const GOOGLE_ERRORS: Record<string, string> = {
  google_auth_cancelled: "تم إلغاء تسجيل الدخول بجوجل",
  google_auth_invalid: "فشل التحقق من تسجيل الدخول بجوجل",
  google_auth_failed: "حدث خطأ أثناء تسجيل الدخول بجوجل",
  google_email_not_verified: "يجب تأكيد بريدك الإلكتروني في جوجل أولاً",
  account_disabled: "هذا الحساب غير مفعّل",
  account_suspended: "تم تعليق حسابك",
};

const FEATURES = [
  { icon: Shield, label: "حماية متقدمة", color: "text-[#0A6CF1]" },
  { icon: Zap, label: "أداء فائق", color: "text-[#FF6636]" },
  { icon: Cloud, label: "سحابة آمنة", color: "text-[#8B2CF5]" },
];

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
          <div className="w-12 h-12 border-4 border-[#0A6CF1] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const err = searchParams.get("error");
    if (err && GOOGLE_ERRORS[err]) {
      setError(GOOGLE_ERRORS[err]);
      window.history.replaceState({}, "", "/login");
    }
  }, [searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowResend(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        return;
      }

      if (data.user?.email_verified === false) {
        setError(data.warning || "بريدك الإلكتروني غير مؤكّد");
        setShowResend(true);
        return;
      }

      setSuccess("تم تسجيل الدخول بنجاح! جاري التحويل...");
      setTimeout(() => {
        if (data.needs_onboarding) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      }, 800);
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) return;
    setSuccess("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSuccess(
        res.ok
          ? "تم إرسال رابط التفعيل إلى بريدك الإلكتروني"
          : data.error || "فشل إعادة الإرسال"
      );
    } catch {
      setSuccess("حدث خطأ في الاتصال");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#0a0a0a]">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-[#0A6CF1]/15 rounded-full blur-[120px]"
          style={{
            animation: "float1 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#8B2CF5]/15 rounded-full blur-[100px]"
          style={{
            animation: "float2 10s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#FF4FD8]/10 rounded-full blur-[80px]"
          style={{
            animation: "float3 12s ease-in-out infinite",
          }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A6CF1]/5 via-transparent to-[#8B2CF5]/5" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {mounted &&
          [...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${(i * 7 + 3) % 100}%`,
                top: `${(i * 13 + 5) % 100}%`,
                animation: `particle${(i % 3) + 1} ${4 + i * 0.5}s ease-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
      </div>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -30px) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -25px) scale(1.15); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(calc(-50% + 10px), calc(-50% - 20px)) scale(1.05); }
        }
        @keyframes particle1 {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-200px) scale(0.5); opacity: 0; }
        }
        @keyframes particle2 {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-150px) translateX(30px) scale(0.3); opacity: 0; }
        }
        @keyframes particle3 {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-180px) translateX(-20px) scale(0.4); opacity: 0; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        .animate-pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-shimmer { animation: shimmer 0.7s ease-out; }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }
        .stagger-7 { animation-delay: 0.7s; }
        .stagger-8 { animation-delay: 0.8s; }
      `}</style>

      <div
        className="w-full max-w-md relative z-10"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.3s" }}
      >
        {/* Logo & Header */}
        <div
          className="text-center mb-8 animate-slide-up"
          style={{ opacity: 0 }}
        >
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0A6CF1]/20 to-[#8B2CF5]/20 border border-white/10 mb-6 relative group cursor-pointer"
            style={{
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.05) rotate(5deg)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1) rotate(0deg)";
            }}
          >
            <div className="absolute inset-0 rounded-3xl border border-[#0A6CF1]/20 animate-spin-slow" />
            <LogIn className="w-9 h-9 text-[#0A6CF1]" />
            <div
              className="absolute -top-1 -right-1 w-4 h-4 bg-[#0A6CF1] rounded-full animate-pulse-dot"
            />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2 animate-slide-up stagger-1" style={{ opacity: 0 }}>
            <span className="gradient-text">Sky Wave ERP</span>
          </h1>
          <p className="text-white/50 text-sm animate-slide-up stagger-2" style={{ opacity: 0 }}>
            إدارة موارد مؤسستك بذكاء وسهولة
          </p>
        </div>

        {/* Login Card */}
        <div
          className="bg-white/[0.03] backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden animate-slide-up stagger-3"
          style={{ opacity: 0 }}
        >
          {/* Card Glow Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#0A6CF1]/50 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#8B2CF5]/50 to-transparent" />

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 flex items-start gap-3 animate-slide-up" style={{ opacity: 0 }}>
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm">{error}</p>
                {showResend && (
                  <button
                    onClick={handleResend}
                    className="text-red-300 hover:text-red-200 text-xs font-medium mt-1 underline underline-offset-2 cursor-pointer"
                  >
                    إعادة إرسال رابط التفعيل
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-6 flex items-center gap-3 animate-slide-up" style={{ opacity: 0 }}>
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="animate-slide-up stagger-4" style={{ opacity: 0 }}>
              <label className="block text-sm font-medium text-white/70 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative group">
                <div
                  className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                    focusedField === "email"
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-50"
                  }`}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(10,108,241,0.15), rgba(139,44,245,0.15))",
                    padding: "1px",
                  }}
                />
                <div className="relative flex items-center">
                  <Mail
                    className={`absolute right-4 w-5 h-5 transition-colors duration-300 ${
                      focusedField === "email"
                        ? "text-[#0A6CF1]"
                        : "text-white/30"
                    }`}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pr-12 pl-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#0A6CF1]/50 transition-all duration-300"
                    placeholder="أدخل اسم المستخدم أو البريد"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="animate-slide-up stagger-5" style={{ opacity: 0 }}>
              <label className="block text-sm font-medium text-white/70 mb-2">
                كلمة المرور
              </label>
              <div className="relative group">
                <div
                  className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                    focusedField === "password"
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-50"
                  }`}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(10,108,241,0.15), rgba(139,44,245,0.15))",
                    padding: "1px",
                  }}
                />
                <div className="relative flex items-center">
                  <Lock
                    className={`absolute right-4 w-5 h-5 transition-colors duration-300 ${
                      focusedField === "password"
                        ? "text-[#0A6CF1]"
                        : "text-white/30"
                    }`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pr-12 pl-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#0A6CF1]/50 transition-all duration-300"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div
              className="flex items-center justify-between text-sm animate-slide-up stagger-6"
              style={{ opacity: 0 }}
            >
              <label className="flex items-center gap-2.5 text-white/50 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md border transition-all duration-300 flex items-center justify-center ${
                      rememberMe
                        ? "bg-[#0A6CF1] border-[#0A6CF1]"
                        : "border-white/20 group-hover:border-white/40"
                    }`}
                  >
                    {rememberMe && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                </div>
                <span className="group-hover:text-white/70 transition-colors">
                  تذكرني
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-[#0A6CF1] hover:text-[#3b8df5] transition-colors flex items-center gap-1 group"
              >
                نسيت كلمة المرور؟
                <ArrowLeft className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </Link>
            </div>

            {/* Login Button */}
            <div className="animate-slide-up stagger-7" style={{ opacity: 0 }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-[#0A6CF1] to-[#8B2CF5] hover:from-[#0955c4] hover:to-[#7a25d4] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base transition-all duration-300 cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <div className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري تسجيل الدخول...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>تسجيل الدخول</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6 animate-slide-up stagger-7" style={{ opacity: 0 }}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/30 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  أو
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Google Button */}
            <div className="animate-slide-up stagger-8" style={{ opacity: 0 }}>
              <a
                href="/api/auth/google"
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl font-medium transition-all duration-300 cursor-pointer group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="group-hover:text-white transition-colors">
                  تسجيل الدخول بجوجل
                </span>
              </a>
            </div>
          </form>

          {/* Register Link */}
          <p className="text-center text-white/40 text-sm mt-8 animate-slide-up stagger-8" style={{ opacity: 0 }}>
            ليس لديك حساب؟{" "}
            <Link
              href="/register"
              className="text-[#0A6CF1] hover:text-[#3b8df5] font-medium transition-colors inline-flex items-center gap-1 group"
            >
              إنشاء حساب جديد
              <ArrowLeft className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </Link>
          </p>
        </div>

        {/* Feature Badges */}
        <div className="flex items-center justify-center gap-6 mt-8 animate-fade-in" style={{ opacity: 0, animationDelay: "1s" }}>
          {FEATURES.map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-2 text-white/40 text-xs"
            >
              <feature.icon className={`w-4 h-4 ${feature.color}`} />
              <span>{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Version Badge */}
        <div className="text-center mt-6 animate-fade-in" style={{ opacity: 0, animationDelay: "1.2s" }}>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/30 text-xs">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Sky Wave ERP v3.0.0
          </span>
        </div>
      </div>
    </div>
  );
}
