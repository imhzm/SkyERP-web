"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
  id: string; username: string; email: string; full_name: string; phone: string | null;
  role: string; account_type: string; serial_number: string | null;
  max_team_members: number; team_members: any[]; company_name: string | null;
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
  const [tab, setTab] = useState("overview");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [teamForm, setTeamForm] = useState({ username: "", email: "", phone: "", password: "", full_name: "" });
  const [teamError, setTeamError] = useState("");
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "", company_name: "" });
  const [profileMsg, setProfileMsg] = useState("");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesPage, setInvoicesPage] = useState(1);
  const [invoicesTotalPages, setInvoicesTotalPages] = useState(1);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  useEffect(() => { fetchUser(); }, []);
  useEffect(() => { if (tab === "invoices") fetchInvoices(); }, [tab, invoicesPage]);

  async function fetchUser() {
    try {
      const res = await fetch("/api/user/me");
      if (!res.ok) { router.push("/login"); return; }
      const data = await res.json();
      setUser(data.user);
      if (data.user.account_type === "client") fetchTeam();
    } catch { router.push("/login"); }
    finally { setLoading(false); }
  }

  async function fetchTeam() {
    try {
      const res = await fetch("/api/user/team");
      if (res.ok) { const data = await res.json(); setTeamMembers(data.team || []); }
    } catch {}
  }

  async function fetchInvoices() {
    setInvoicesLoading(true);
    try {
      const res = await fetch(`/api/user/invoices?page=${invoicesPage}&limit=20`);
      if (res.ok) { const data = await res.json(); setInvoices(data.invoices || []); setInvoicesTotalPages(data.pagination?.total_pages || 1); }
    } catch {}
    finally { setInvoicesLoading(false); }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(""); setPwSuccess("");
    try {
      const res = await fetch("/api/user/me/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.error || "حدث خطأ"); return; }
      setPwSuccess("تم تغيير كلمة المرور");
      setTimeout(() => router.push("/login"), 2000);
    } catch { setPwError("حدث خطأ"); }
  }

  async function handleAddTeam(e: React.FormEvent) {
    e.preventDefault();
    setTeamError(""); setTeamLoading(true);
    try {
      const res = await fetch("/api/user/team", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamForm),
      });
      const data = await res.json();
      if (!res.ok) { setTeamError(data.error || "حدث خطأ"); return; }
      setShowAddTeam(false);
      setTeamForm({ username: "", email: "", phone: "", password: "", full_name: "" });
      fetchTeam();
    } catch { setTeamError("حدث خطأ"); }
    finally { setTeamLoading(false); }
  }

  async function handleRemoveTeam(memberId: string) {
    try {
      await fetch(`/api/user/team/${memberId}`, { method: "DELETE" });
      fetchTeam();
    } catch {}
  }

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="text-gray-400">جاري التحميل...</div></div>;
  if (!user) return null;

  const activation = user.activation || { status: "trial", subscription: { plan: "trial" } };
  const sub = activation.subscription || {};
  const now = new Date();
  let subStatus: { label: string; color: string; message: string } = { label: "نشط", color: "text-green-400", message: "اشتراكك نشط" };

  if (activation.status === "suspended") {
    subStatus = { label: "معلق", color: "text-red-400", message: "حسابك معلق — تواصل مع الإدارة" };
  } else if (activation.status === "expired" || (sub.end_date && new Date(sub.end_date) < now)) {
    subStatus = { label: "منتهي", color: "text-yellow-400", message: "انتهت صلاحية اشتراكك — جدد من الموقع" };
  } else if (activation.status === "trial") {
    const trialEnd = activation.trial_end ? new Date(activation.trial_end) : null;
    if (trialEnd && trialEnd < now) {
      subStatus = { label: "منتهي", color: "text-yellow-400", message: "انتهت الفترة التجريبية — اشترك الآن" };
    } else {
      const remaining = trialEnd ? Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : 14;
      subStatus = { label: "تجريبي", color: "text-blue-400", message: `متبقي ${remaining} يوم` };
    }
  }

  const subDaysLeft = sub.end_date ? Math.ceil((new Date(sub.end_date).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : null;
  const subProgress = subDaysLeft !== null && subDaysLeft > 0 ? Math.min(100, Math.round((subDaysLeft / 365) * 100)) : 0;

  const tabs = [
    { k: "overview", l: "الرئيسية" },
    { k: "profile", l: "ملفي الشخصي" },
    ...(user.account_type === "client" ? [{ k: "invoices", l: "الفواتير" }] : []),
    ...(user.account_type === "client" ? [{ k: "team", l: "الفريق" }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]" dir="rtl">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a0a0a] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0A6CF1] to-[#8B2CF5] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-white font-medium text-sm">Sky ERP</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowPasswordModal(true)} className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white transition cursor-pointer">تغيير كلمة المرور</button>
            <button onClick={handleLogout} className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-red-400 transition cursor-pointer">تسجيل الخروج</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 mt-4">
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {tabs.map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`flex-1 py-2 text-sm rounded-md transition cursor-pointer ${tab === t.k ? "bg-[#0A6CF1] text-white" : "text-gray-400 hover:text-white"}`}>{t.l}</button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {tab === "overview" && (
          <>
            {/* Welcome */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white">مرحباً {user.full_name || user.username}</h1>
                  <p className="text-gray-400 text-sm mt-1">{user.email}</p>
                  {user.serial_number && (
                    <p className="text-xs text-gray-500 mt-1 font-mono" dir="ltr">الرقم التسلسلي: <span className="text-[#0A6CF1]">{user.serial_number}</span></p>
                  )}
                  {user.company_name && <p className="text-xs text-gray-500 mt-0.5">{user.company_name}</p>}
                </div>
              </div>
            </div>

            {/* Subscription */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white">حالة الاشتراك</h2>
                <span className={`text-sm font-bold ${subStatus.color}`}>{subStatus.label}</span>
              </div>
              {subDaysLeft !== null && subDaysLeft > 0 && (
                <div className="mb-4">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${subStatus.color.replace("text-", "bg-")}`} style={{ width: `${subProgress}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{subDaysLeft} يوم متبقي</p>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div><p className="text-xs text-gray-500">الخطة</p><p className="text-white">{sub.plan === "trial" ? "تجريبي" : sub.plan === "monthly" ? "شهري" : sub.plan === "half_yearly" ? "نصف سنوي" : sub.plan === "yearly" ? "سنوي" : "دائم"}</p></div>
                {sub.end_date && <div><p className="text-xs text-gray-500">تاريخ الانتهاء</p><p className="text-white">{new Date(sub.end_date).toLocaleDateString("ar-EG")}</p></div>}
                <div><p className="text-xs text-gray-500">الأجهزة المسموحة</p><p className="text-white">{activation.max_devices || 1}</p></div>
                <div><p className="text-xs text-gray-500">حالة الجهاز</p><p className={user.hardware_hash ? "text-green-400" : "text-gray-400"}>{user.hardware_hash ? "مقيد" : "غير مقيد"}</p></div>
              </div>
              {subStatus.label === "منتهي" && (
                <a href="/pricing" className="mt-4 inline-block px-4 py-2 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition">تجديد الاشتراك</a>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Device */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h2 className="text-sm font-bold text-white mb-4">الجهاز المسجل</h2>
                {user.hardware_hash ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">بصمة الجهاز</p>
                    <p className="text-white text-sm font-mono" dir="ltr">{user.hardware_hash}</p>
                    {user.hardware_first_login && (
                      <><p className="text-xs text-gray-500 mt-3 mb-1">تاريخ التسجيل</p><p className="text-white text-sm">{new Date(user.hardware_first_login).toLocaleDateString("ar-EG")}</p></>
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
                <h2 className="text-sm font-bold text-white mb-4">جلسات تسجيل الدخول</h2>
                {user.sessions && user.sessions.length > 0 ? (
                  <div className="space-y-2">
                    {user.sessions.slice(-5).reverse().map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-sm">
                        <div><p className="text-gray-300">{s.type === "web" ? "موقع" : "برنامج"}</p><p className="text-xs text-gray-500">{new Date(s.login_at).toLocaleString("ar-EG")}</p></div>
                        <span className="text-xs text-gray-500">{s.ip}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 text-sm">لا توجد جلسات سابقة</p>}
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-6 bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-sm font-bold text-white mb-4">روابط سريعة</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link href="/download" className="px-4 py-3 bg-white/5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition text-center">تحميل البرنامج</Link>
                {user.account_type === "client" && (
                  <button onClick={() => setTab("team")} className="px-4 py-3 bg-white/5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition text-center cursor-pointer">إدارة الفريق</button>
                )}
                {subStatus.label === "منتهي" && (
                  <Link href="/pricing" className="px-4 py-3 bg-[#0A6CF1]/10 rounded-lg text-sm text-[#0A6CF1] hover:bg-[#0A6CF1]/20 transition text-center">تجديد الاشتراك</Link>
                )}
              </div>
            </div>
          </>
        )}

        {/* Profile Tab */}
        {tab === "profile" && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">ملفي الشخصي</h2>
              {!profileEdit && <button onClick={() => { setProfileForm({ full_name: user.full_name || "", phone: user.phone || "", company_name: user.company_name || "" }); setProfileEdit(true); setProfileMsg(""); }} className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition cursor-pointer">تعديل</button>}
            </div>
            {profileMsg && <div className="bg-green-500/10 text-green-400 rounded-lg px-4 py-3 mb-4 text-sm">{profileMsg}</div>}
            {profileEdit ? (
              <form onSubmit={async (e) => { e.preventDefault(); setProfileMsg(""); try { const res = await fetch("/api/user/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profileForm) }); if (!res.ok) return; setProfileMsg("تم تحديث الملف"); setProfileEdit(false); fetchUser(); } catch {} }} className="space-y-4 max-w-md">
                <div><label className="block text-xs text-gray-400 mb-1">الاسم كامل</label><input type="text" value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" required /></div>
                <div><label className="block text-xs text-gray-400 mb-1">رقم الهاتف</label><input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" dir="ltr" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">الشركة</label><input type="text" value={profileForm.company_name} onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></div>
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer">حفظ</button>
                  <button type="button" onClick={() => setProfileEdit(false)} className="px-4 py-2 bg-white/5 text-gray-400 rounded-lg text-sm hover:text-white transition cursor-pointer">إلغاء</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div><p className="text-xs text-gray-500 mb-1">اسم المستخدم</p><p className="text-white">{user.username}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">البريد الإلكتروني</p><p className="text-white">{user.email}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">الاسم كامل</p><p className="text-white">{user.full_name || "—"}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">رقم الهاتف</p><p className="text-white">{user.phone || "—"}</p></div>
                {user.serial_number && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">الرقم التسلسلي</p>
                    <p className="text-white font-mono text-sm flex items-center gap-2" dir="ltr">
                      {user.serial_number}
                      <button onClick={() => navigator.clipboard.writeText(user.serial_number || "")} className="text-[#0A6CF1] text-xs hover:underline cursor-pointer">نسخ</button>
                    </p>
                  </div>
                )}
                {user.company_name && <div><p className="text-xs text-gray-500 mb-1">الشركة</p><p className="text-white">{user.company_name}</p></div>}
                <div><p className="text-xs text-gray-500 mb-1">تاريخ التسجيل</p><p className="text-white">{new Date(user.created_at).toLocaleDateString("ar-EG")}</p></div>
                {user.last_login && <div><p className="text-xs text-gray-500 mb-1">آخر دخول</p><p className="text-white">{new Date(user.last_login).toLocaleString("ar-EG")}</p></div>}
              </div>
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {tab === "invoices" && user.account_type === "client" && (
          <div>
            <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white">الفواتير</h2>
                <button onClick={() => { setInvoicesPage(1); fetchInvoices(); }} className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition cursor-pointer">تحديث</button>
              </div>
              {invoicesLoading ? <div className="text-center py-8 text-gray-500 text-sm">جاري التحميل...</div>
              : invoices.length === 0 ? <p className="text-gray-500 text-sm text-center py-8">لا توجد فواتير</p>
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-right px-3 py-2 text-gray-400 font-medium">رقم الفاتورة</th>
                        <th className="text-right px-3 py-2 text-gray-400 font-medium">الخطة</th>
                        <th className="text-right px-3 py-2 text-gray-400 font-medium">المبلغ</th>
                        <th className="text-right px-3 py-2 text-gray-400 font-medium">الحالة</th>
                        <th className="text-right px-3 py-2 text-gray-400 font-medium">تاريخ الإصدار</th>
                        <th className="text-right px-3 py-2 text-gray-400 font-medium">تاريخ الاستحقاق</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv: any) => {
                        const invStatusColor: Record<string, string> = {
                          paid: "text-green-400", pending: "text-yellow-400", overdue: "text-red-400",
                          cancelled: "text-gray-400", refunded: "text-purple-400",
                        };
                        const invStatusLabel: Record<string, string> = {
                          paid: "مدفوعة", pending: "معلقة", overdue: "متأخرة", cancelled: "ملغية", refunded: "مسترجع",
                        };
                        return (
                          <tr key={inv._id} className="border-b border-white/5 hover:bg-white/5 transition">
                            <td className="px-3 py-2 text-white text-xs font-mono" dir="ltr">{inv.invoice_number}</td>
                            <td className="px-3 py-2 text-gray-400 text-xs">{inv.plan === "monthly" ? "شهري" : inv.plan === "half_yearly" ? "نصف سنوي" : inv.plan === "yearly" ? "سنوي" : inv.plan === "lifetime" ? "دائم" : inv.plan}</td>
                            <td className="px-3 py-2 text-white text-xs">{inv.amount} {inv.currency}</td>
                            <td className="px-3 py-2"><span className={`text-xs ${invStatusColor[inv.status] || "text-gray-400"}`}>{invStatusLabel[inv.status] || inv.status}</span></td>
                            <td className="px-3 py-2 text-gray-500 text-xs">{inv.issued_date ? new Date(inv.issued_date).toLocaleDateString("ar-EG") : "—"}</td>
                            <td className="px-3 py-2 text-gray-500 text-xs">{inv.due_date ? new Date(inv.due_date).toLocaleDateString("ar-EG") : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {invoicesTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/10">
                  <button onClick={() => { setInvoicesPage(Math.max(1, invoicesPage - 1)); }} disabled={invoicesPage <= 1} className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-400 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">السابق</button>
                  <span className="text-sm text-gray-400">{invoicesPage} / {invoicesTotalPages}</span>
                  <button onClick={() => { setInvoicesPage(Math.min(invoicesTotalPages, invoicesPage + 1)); }} disabled={invoicesPage >= invoicesTotalPages} className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-400 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">التالي</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Team Tab */}
        {tab === "team" && user.account_type === "client" && (
          <div>
            <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white">أعضاء الفريق ({teamMembers.length}/{user.max_team_members})</h2>
                {teamMembers.length < (user.max_team_members || 0) && (
                  <button onClick={() => setShowAddTeam(true)} className="px-3 py-1.5 text-xs bg-[#0A6CF1] text-white rounded-lg hover:bg-[#0955c4] transition cursor-pointer">+ إضافة عضو</button>
                )}
              </div>
              {teamMembers.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">لا يوجد أعضاء فريق</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-right px-3 py-2 text-gray-400 font-medium">الاسم</th>
                        <th className="text-right px-3 py-2 text-gray-400 font-medium">البريد</th>
                        <th className="text-right px-3 py-2 text-gray-400 font-medium">الحالة</th>
                        <th className="text-right px-3 py-2 text-gray-400 font-medium">الجهاز</th>
                        <th className="text-center px-3 py-2 text-gray-400 font-medium">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((m: any) => (
                        <tr key={m.id} className="border-b border-white/5">
                          <td className="px-3 py-2 text-white">{m.full_name || m.username}</td>
                          <td className="px-3 py-2 text-gray-400 text-xs">{m.email}</td>
                          <td className="px-3 py-2"><span className={`text-xs ${m.is_active ? "text-green-400" : "text-red-400"}`}>{m.is_active ? "نشط" : "موقوف"}</span></td>
                          <td className="px-3 py-2 text-xs text-gray-500">{m.has_device_binding ? "مقيد" : "غير مقيد"}</td>
                          <td className="px-3 py-2 text-center">
                            <button onClick={() => handleRemoveTeam(m.id)} className="text-xs text-red-400 hover:text-red-300 cursor-pointer">حذف</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
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
                <div><label className="block text-xs text-gray-400 mb-1">كلمة المرور الحالية</label><input type="password" value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" required /></div>
                <div><label className="block text-xs text-gray-400 mb-1">كلمة المرور الجديدة</label><input type="password" value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" required /></div>
                <div><label className="block text-xs text-gray-400 mb-1">تأكيد كلمة المرور</label><input type="password" value={pwForm.confirm_password} onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" required /></div>
                <button type="submit" className="w-full py-2.5 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer">تغيير كلمة المرور</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Team Member Modal */}
      {showAddTeam && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">إضافة عضو فريق</h2>
              <button onClick={() => setShowAddTeam(false)} className="text-gray-400 hover:text-white cursor-pointer text-xl">✕</button>
            </div>
            {teamError && <div className="bg-red-500/10 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">{teamError}</div>}
            <form onSubmit={handleAddTeam} className="space-y-4">
              <div><label className="block text-xs text-gray-400 mb-1">اسم المستخدم *</label><input type="text" value={teamForm.username} onChange={(e) => setTeamForm({ ...teamForm, username: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" required /></div>
              <div><label className="block text-xs text-gray-400 mb-1">الاسم كامل *</label><input type="text" value={teamForm.full_name} onChange={(e) => setTeamForm({ ...teamForm, full_name: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" required /></div>
              <div><label className="block text-xs text-gray-400 mb-1">البريد الإلكتروني *</label><input type="email" value={teamForm.email} onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" required dir="ltr" /></div>
              <div><label className="block text-xs text-gray-400 mb-1">كلمة المرور *</label><input type="password" value={teamForm.password} onChange={(e) => setTeamForm({ ...teamForm, password: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" required minLength={8} /></div>
              <div><label className="block text-xs text-gray-400 mb-1">رقم الهاتف (اختياري)</label><input type="tel" value={teamForm.phone} onChange={(e) => setTeamForm({ ...teamForm, phone: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" dir="ltr" /></div>
              <button type="submit" disabled={teamLoading} className="w-full py-2.5 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer">{teamLoading ? "جاري..." : "إضافة"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
