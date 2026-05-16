"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
  id: string; username: string; email: string; full_name: string; phone: string | null;
  role: string; email_verified: boolean;
  activation: { status: string; trial_end: string | null; max_devices: number;
    subscription: { plan: string; end_date: string | null; }; };
  hardware_hash: string | null; hardware_first_login: string | null;
  sessions: { id: string; type: string; device_info: string; ip: string; login_at: string; last_active: string }[];
  created_at: string; last_login: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch("/api/user/me");
      if (!res.ok) { router.push("/login"); return; }
      const data = await res.json();
      setUser(data.user);
    } catch { router.push("/login"); }
    finally { setLoading(false); }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    try {
      const res = await fetch("/api/user/me/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.error || "حدث خطأ"); return; }
      setPwSuccess("تم تغيير كلمة المرور، سيتم تحويلك لتسجيل الدخول");
      setTimeout(() => router.push("/login"), 2000);
    } catch { setPwError("حدث خطأ"); }
  }

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="text-gray-400">جاري التحميل...</div></div>;
  if (!user) return null;

  const activation = user.activation || { status: "trial", subscription: { plan: "trial" } };
  const sub = activation.subscription || {};
  const now = new Date();
  let subscriptionStatus: { label: string; color: string; message: string } = { label: "نشط", color: "text-green-400", message: "اشتراكك نشط" };

  if (activation.status === "suspended") {
    subscriptionStatus = { label: "معلق", color: "text-red-400", message: "حسابك معلق — تواصل مع الإدارة" };
  } else if (activation.status === "expired" || (sub.end_date && new Date(sub.end_date) < now)) {
    subscriptionStatus = { label: "منتهي", color: "text-yellow-400", message: "انتهت صلاحية اشتراكك — جدد من الموقع" };
  } else if (activation.status === "trial") {
    const trialEnd = activation.trial_end ? new Date(activation.trial_end) : null;
    if (trialEnd && trialEnd < now) {
      subscriptionStatus = { label: "منتهي", color: "text-yellow-400", message: "انتهت الفترة التجريبية — اشترك الآن" };
    } else {
      const remaining = trialEnd ? Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : 14;
      subscriptionStatus = { label: "تجريبي", color: "text-blue-400", message: `متبقي ${remaining} يوم في الفترة التجريبية` };
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 sm:p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">مرحباً {user.full_name || user.username}</h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowPasswordModal(true)}
              className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white transition cursor-pointer">
              تغيير كلمة المرور
            </button>
            <button onClick={handleLogout}
              className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-red-400 transition cursor-pointer">
              تسجيل الخروج
            </button>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">حالة الاشتراك</p>
              <p className={`text-lg font-bold ${subscriptionStatus.color}`}>{subscriptionStatus.label}</p>
              <p className="text-sm text-gray-400 mt-1">{subscriptionStatus.message}</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500 mb-1">الخطة</p>
              <p className="text-white font-medium">{sub.plan === "trial" ? "تجريبي" : sub.plan === "monthly" ? "شهري" : sub.plan === "half_yearly" ? "نصف سنوي" : sub.plan === "yearly" ? "سنوي" : "دائم"}</p>
              {sub.end_date && (
                <p className="text-xs text-gray-500 mt-1">حتى {new Date(sub.end_date).toLocaleDateString("ar-EG")}</p>
              )}
            </div>
          </div>
          {subscriptionStatus.label === "منتهي" && (
            <a href="/pricing" className="mt-4 inline-block px-4 py-2 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition">
              تجديد الاشتراك
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Device Info */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-sm font-medium text-white mb-4">الجهاز المسجل</h2>
            {user.hardware_hash ? (
              <div>
                <p className="text-xs text-gray-500 mb-1">بصمة الجهاز</p>
                <p className="text-white text-sm font-mono" dir="ltr">{user.hardware_hash}</p>
                {user.hardware_first_login && (
                  <>
                    <p className="text-xs text-gray-500 mt-3 mb-1">تاريخ التسجيل</p>
                    <p className="text-white text-sm">{new Date(user.hardware_first_login).toLocaleDateString("ar-EG")}</p>
                  </>
                )}
                <p className="text-xs text-green-400 mt-3">✓ هذا الجهاز مسجل لحسابك</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-400 text-sm">لم يتم تسجيل أي جهاز بعد</p>
                <p className="text-xs text-gray-500 mt-1">سجل الدخول من برنامج الديسكتوب لتسجيل جهازك</p>
              </div>
            )}
          </div>

          {/* Sessions */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-sm font-medium text-white mb-4">جلسات تسجيل الدخول</h2>
            {user.sessions && user.sessions.length > 0 ? (
              <div className="space-y-2">
                {user.sessions.slice(-5).reverse().map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-300">{s.type === "web" ? "موقع" : "برنامج"}</p>
                      <p className="text-xs text-gray-500">{new Date(s.login_at).toLocaleString("ar-EG")}</p>
                    </div>
                    <span className="text-xs text-gray-500">{s.ip}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">لا توجد جلسات سابقة</p>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 bg-white/5 rounded-xl border border-white/10 p-6">
          <h2 className="text-sm font-medium text-white mb-4">روابط سريعة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link href="/download" className="px-4 py-3 bg-white/5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition text-center">
              تحميل البرنامج
            </Link>
            {subscriptionStatus.label === "منتهي" && (
              <Link href="/pricing" className="px-4 py-3 bg-[#0A6CF1]/10 rounded-lg text-sm text-[#0A6CF1] hover:bg-[#0A6CF1]/20 transition text-center">
                تجديد الاشتراك
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">تغيير كلمة المرور</h2>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-white cursor-pointer text-xl">✕</button>
            </div>
            {pwError && <div className="bg-red-500/10 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">{pwError}</div>}
            {pwSuccess && <div className="bg-green-500/10 text-green-400 rounded-lg px-4 py-3 mb-4 text-sm">{pwSuccess}</div>}
            {!pwSuccess && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">كلمة المرور الحالية</label>
                  <input type="password" value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">كلمة المرور الجديدة</label>
                  <input type="password" value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">تأكيد كلمة المرور</label>
                  <input type="password" value={pwForm.confirm_password} onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" required />
                </div>
                <button type="submit" className="w-full py-2.5 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer">
                  تغيير كلمة المرور
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
