"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ConfirmDialog } from "@/components/admin/Modal";

interface Detail {
  id: string; username: string; email: string; full_name: string; phone: string | null;
  role: string; is_active: boolean; email_verified: boolean;
  hardware_hash: string | null; hardware_first_login: string | null;
  hardware_info: any;
  activation: { status: string; trial_start: string | null; trial_end: string | null; max_devices: number;
    subscription: { plan: string; start_date: string | null; end_date: string | null; auto_renew: boolean; grace_period_end: string | null } };
  failed_login_attempts: number; locked_until: string | null;
  sessions: any[]; audit_log: any[];
  created_at: string; last_login: string | null; last_modified: string;
}

const actionLabels: Record<string, string> = {
  register: "تسجيل", login: "دخول", login_failed: "فشل دخول", password_change: "تغيير كلمة المرور",
  device_bind: "ربط جهاز", device_reset: "إعادة تعيين الجهاز", subscription_change: "تعديل اشتراك",
  admin_create_user: "إنشاء بواسطة المشرف", admin_update_user: "تعديل بواسطة المشرف",
  admin_delete_user: "حذف بواسطة المشرف", admin_reset_device: "إعادة جهاز بواسطة المشرف",
  admin_update_subscription: "تعديل اشتراك بواسطة المشرف",
  admin_lock_user: "قفل بواسطة المشرف", admin_unlock_user: "فتح بواسطة المشرف",
  admin_force_logout: "إنهاء جلسات بواسطة المشرف",
};

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<Detail | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");
  const [editForm, setEditForm] = useState({ full_name: "", phone: "", role: "", is_active: true, activation_status: "" });
  const [subForm, setSubForm] = useState({ plan: "", end_date: "", auto_renew: false });
  const [message, setMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  useEffect(() => { document.title = "تفاصيل المستخدم - Sky ERP"; fetchUser(); fetchInvoices(); }, [userId]);

  async function fetchUser() {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setUser(data.user);
      setEditForm({ full_name: data.user.full_name || "", phone: data.user.phone || "", role: data.user.role, is_active: data.user.is_active, activation_status: data.user.activation?.status || "active" });
      setSubForm({ plan: data.user.activation?.subscription?.plan || "monthly", end_date: data.user.activation?.subscription?.end_date ? new Date(data.user.activation.subscription.end_date).toISOString().split("T")[0] : "", auto_renew: data.user.activation?.subscription?.auto_renew || false });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function fetchInvoices() {
    try { const r = await fetch(`/api/admin/billing/invoices?user_id=${userId}`); if (r.ok) setInvoices((await r.json()).invoices || []); } catch {}
  }

  async function saveField(url: string, body: any, method = "PATCH") {
    setMessage("");
    try {
      const opts: RequestInit = { method, headers: { "Content-Type": "application/json" } };
      if (method !== "GET" && method !== "DELETE") opts.body = JSON.stringify(body);
      const res = await fetch(url, opts);
      const data = await res.json();
      if (!res.ok) { setMessage(data.error || "حدث خطأ"); return; }
      setMessage("تم الحفظ"); fetchUser();
    } catch { setMessage("حدث خطأ"); }
  }

  async function lockUser() {
    setMessage("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/lock`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ duration_minutes: 60 }) });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error || "حدث خطأ"); return; }
      setMessage(data.message); fetchUser();
    } catch { setMessage("حدث خطأ"); }
  }

  async function forceLogout() {
    setMessage("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/sessions`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error || "حدث خطأ"); return; }
      setMessage(data.message); fetchUser();
    } catch { setMessage("حدث خطأ"); }
  }

  if (loading) return <div className="p-6 text-center text-gray-500">جاري التحميل...</div>;
  if (!user) return <div className="p-6 text-center text-gray-500">المستخدم غير موجود</div>;

  const isLocked = user.locked_until && new Date(user.locked_until) > new Date();
  const statusColor: Record<string, string> = { active: "text-green-400", suspended: "text-red-400", expired: "text-yellow-400", trial: "text-blue-400" };
  const invStatusColor: Record<string, string> = { paid: "bg-green-500/20 text-green-400", overdue: "bg-red-500/20 text-red-400", pending: "bg-yellow-500/20 text-yellow-400", cancelled: "bg-gray-500/20 text-gray-400", refunded: "bg-purple-500/20 text-purple-400" };

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/users" className="text-gray-400 text-sm hover:text-white transition">← العودة للمستخدمين</Link>

        <div className="flex items-start justify-between mt-2 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{user.full_name || user.username}</h1>
            <p className="text-gray-400 text-sm">{user.email} · <span className={statusColor[user.activation?.status || "trial"]}>{user.activation?.status}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={lockUser} className={`px-3 py-1.5 text-xs rounded-lg border transition cursor-pointer ${isLocked ? "border-green-500/20 text-green-400 bg-green-500/10 hover:bg-green-500/20" : "border-orange-500/20 text-orange-400 bg-orange-500/10 hover:bg-orange-500/20"}`}>{isLocked ? "فتح الحساب" : "قفل الحساب"}</button>
            <button onClick={() => setConfirmAction({ title: "إنهاء الجلسات", message: "هل أنت متأكد من إنهاء كل جلسات المستخدم؟", onConfirm: forceLogout })} className="px-3 py-1.5 text-xs border border-red-500/20 text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition cursor-pointer">إنهاء الجلسات</button>
          </div>
        </div>

        {message && <div className={`${message === "حدث خطأ" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"} rounded-lg px-4 py-3 mb-4 text-sm`}>{message}</div>}

        <div className="flex gap-1 mb-6 bg-white/5 rounded-lg p-1 overflow-x-auto">
          {[{ k: "profile", l: "الملف الشخصي" }, { k: "device", l: "الجهاز" }, { k: "subscription", l: "الاشتراك" }, { k: "billing", l: "الفواتير" }, { k: "sessions", l: "الجلسات" }].map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)} className={`flex-1 py-2 text-sm rounded-md transition cursor-pointer whitespace-nowrap ${tab === t.k ? "bg-[#0A6CF1] text-white" : "text-gray-400 hover:text-white"}`}>{t.l}</button>
          ))}
        </div>

        {/* Profile */}
        {tab === "profile" && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[{ label: "اسم المستخدم", value: user.username }, { label: "البريد الإلكتروني", value: user.email + (user.email_verified ? " (مؤكد)" : "") }, { label: "الاسم كامل", value: user.full_name || "—" }, { label: "الهاتف", value: user.phone || "—" }, { label: "الدور", value: <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300">{user.role}</span> }, { label: "تاريخ الإنشاء", value: new Date(user.created_at).toLocaleDateString("ar-EG") }, { label: "آخر دخول", value: user.last_login ? new Date(user.last_login).toLocaleString("ar-EG") : "—" }, { label: "محاولات فاشلة", value: <span className={user.failed_login_attempts > 0 ? "text-red-400" : "text-white"}>{user.failed_login_attempts}</span> }, { label: "الحساب", value: <span className={user.is_active ? "text-green-400" : "text-red-400"}>{user.is_active ? "نشط" : "موقوف"}</span> }].map((f) => (
                <div key={f.label}><p className="text-xs text-gray-500 mb-1">{f.label}</p><p className="text-white">{f.value}</p></div>
              ))}
            </div>
            <div className="mt-6 border-t border-white/10 pt-4">
              <h3 className="text-sm font-medium text-white mb-3">تعديل</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><label className="block text-xs text-gray-400 mb-1">الاسم كامل</label><input type="text" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">الهاتف</label><input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" dir="ltr" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">الدور</label><select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm"><option value="admin">مدير</option><option value="accountant">محاسب</option><option value="sales">مبيعات</option><option value="employee">موظف</option></select></div>
                <div className="flex items-end pb-2"><label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer"><input type="checkbox" checked={editForm.is_active} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })} className="rounded border-white/20 bg-white/5" />الحساب نشط</label></div>
              </div>
              <button onClick={() => saveField(`/api/admin/users/${userId}`, editForm)} className="mt-3 px-4 py-2 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer">حفظ</button>
            </div>
          </div>
        )}

        {/* Device */}
        {tab === "device" && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div><p className="text-xs text-gray-500 mb-1">بصمة الجهاز</p><p className="text-white text-sm font-mono" dir="ltr">{user.hardware_hash ? user.hardware_hash.substring(0, 32) + "…" : "غير مقيد"}</p></div>
              <div><p className="text-xs text-gray-500 mb-1">أول تسجيل</p><p className="text-white text-sm">{user.hardware_first_login ? new Date(user.hardware_first_login).toLocaleString("ar-EG") : "—"}</p></div>
            </div>
            {user.hardware_info && <div className="border-t border-white/10 pt-4"><h3 className="text-sm font-medium text-white mb-3">معلومات الجهاز</h3><div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500 mb-1">اسم الجهاز</p><p className="text-white text-sm">{user.hardware_info.hostname || "—"}</p></div>
              <div><p className="text-xs text-gray-500 mb-1">نظام التشغيل</p><p className="text-white text-sm">{user.hardware_info.os || "—"}</p></div>
              <div><p className="text-xs text-gray-500 mb-1">IP التسجيل</p><p className="text-white text-sm" dir="ltr">{user.hardware_info.registered_ip || "—"}</p></div>
            </div></div>}
            <button onClick={() => setConfirmAction({ title: "إعادة تعيين الجهاز", message: "هل أنت متأكد من إعادة تعيين ربط الجهاز؟ سيكون على المستخدم تسجيل الدخول من الجهاز مرة أخرى.", onConfirm: async () => { await saveField(`/api/admin/users/${userId}/reset-device`, {}, "POST"); } })} className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20 transition cursor-pointer">إعادة تعيين ربط الجهاز</button>
          </div>
        )}

        {/* Subscription */}
        {tab === "subscription" && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div><p className="text-xs text-gray-500 mb-1">الحالة</p><p className={`${statusColor[user.activation?.status || "trial"]} text-sm font-medium`}>{user.activation?.status}</p></div>
              <div><p className="text-xs text-gray-500 mb-1">الخطة</p><p className="text-white text-sm">{user.activation?.subscription?.plan}</p></div>
              <div><p className="text-xs text-gray-500 mb-1">تاريخ البداية</p><p className="text-white text-sm">{user.activation?.subscription?.start_date ? new Date(user.activation.subscription.start_date).toLocaleDateString("ar-EG") : "—"}</p></div>
              <div><p className="text-xs text-gray-500 mb-1">تاريخ الانتهاء</p><p className="text-white text-sm">{user.activation?.subscription?.end_date ? new Date(user.activation.subscription.end_date).toLocaleDateString("ar-EG") : "—"}</p></div>
              {user.activation?.subscription?.grace_period_end && <div><p className="text-xs text-gray-500 mb-1">فترة السماح</p><p className="text-yellow-400 text-sm">{new Date(user.activation.subscription.grace_period_end).toLocaleDateString("ar-EG")}</p></div>}
              <div><p className="text-xs text-gray-500 mb-1">التجديد التلقائي</p><p className="text-white text-sm">{user.activation?.subscription?.auto_renew ? "مفعل" : "غير مفعل"}</p></div>
            </div>
            <div className="border-t border-white/10 pt-4"><h3 className="text-sm font-medium text-white mb-3">تعديل الاشتراك</h3>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs text-gray-400 mb-1">الخطة</label><select value={subForm.plan} onChange={(e) => setSubForm({ ...subForm, plan: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#0A6CF1]"><option value="trial">تجريبي</option><option value="monthly">شهري</option><option value="half_yearly">نصف سنوي</option><option value="yearly">سنوي</option><option value="lifetime">دائم</option></select></div>
                <div><label className="block text-xs text-gray-400 mb-1">تاريخ الانتهاء</label><input type="date" value={subForm.end_date} onChange={(e) => setSubForm({ ...subForm, end_date: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" /></div>
                <div className="flex items-end pb-2"><label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer"><input type="checkbox" checked={subForm.auto_renew} onChange={(e) => setSubForm({ ...subForm, auto_renew: e.target.checked })} className="rounded border-white/20 bg-white/5" />تجديد تلقائي</label></div>
              </div>
              <button onClick={() => saveField(`/api/admin/users/${userId}/subscription`, subForm)} className="mt-4 px-4 py-2 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer">حفظ التعديلات</button>
            </div>
          </div>
        )}

        {/* Billing */}
        {tab === "billing" && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-medium text-white">الفواتير</h3><Link href={`/admin/billing/invoices?user_id=${userId}`} className="text-xs text-[#0A6CF1] hover:underline">عرض الكل</Link></div>
            {invoices.length === 0 ? <p className="text-gray-500 text-sm text-center py-6">لا توجد فواتير</p> : (
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-white/10">{["رقم الفاتورة", "الخطة", "المبلغ", "الحالة", "تاريخ الإصدار", "تاريخ الاستحقاق"].map((h) => <th key={h} className="text-right px-3 py-2 text-gray-400 font-medium">{h}</th>)}</tr></thead>
                <tbody>{invoices.map((inv: any) => (<tr key={inv._id} className="border-b border-white/5">
                  <td className="px-3 py-2"><Link href={`/admin/billing/invoices/${inv._id}`} className="text-[#0A6CF1] hover:underline text-xs">{inv.invoice_number}</Link></td>
                  <td className="px-3 py-2 text-gray-400 text-xs">{inv.plan}</td>
                  <td className="px-3 py-2 text-white text-xs">{inv.amount} {inv.currency}</td>
                  <td className="px-3 py-2"><span className={`text-xs px-1.5 py-0.5 rounded ${invStatusColor[inv.status] || "bg-gray-500/20 text-gray-400"}`}>{inv.status}</span></td>
                  <td className="px-3 py-2 text-gray-500 text-xs">{inv.issued_date ? new Date(inv.issued_date).toLocaleDateString("ar-EG") : "—"}</td>
                  <td className="px-3 py-2 text-gray-500 text-xs">{inv.due_date ? new Date(inv.due_date).toLocaleDateString("ar-EG") : "—"}</td>
                </tr>))}</tbody></table></div>
            )}
          </div>
        )}

        {/* Sessions */}
        {tab === "sessions" && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-medium text-white">الجلسات ({user.sessions?.length || 0})</h3><button onClick={() => setConfirmAction({ title: "إنهاء الجلسات", message: "هل أنت متأكد من إنهاء كل جلسات المستخدم؟", onConfirm: forceLogout })} className="px-3 py-1.5 text-xs border border-red-500/20 text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition cursor-pointer">إنهاء الكل</button></div>
            {!user.sessions?.length ? <p className="text-gray-500 text-sm text-center py-6">لا توجد جلسات نشطة</p> : (
              <div className="space-y-2">{user.sessions.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div><p className="text-sm text-white">{s.type === "web" ? "ويب" : "تطبيق"}</p><p className="text-xs text-gray-500">{s.device_info || "—"} · {s.ip}</p></div>
                  <div className="text-left"><p className="text-xs text-gray-500">آخر نشاط: {s.last_active ? new Date(s.last_active).toLocaleString("ar-EG") : "—"}</p></div>
                </div>
              ))}</div>
            )}
          </div>
        )}

        {/* Audit Log */}
        <div className="mt-6"><h2 className="text-lg font-bold text-white mb-4">سجل النشاطات</h2>
          <div className="bg-white/5 rounded-xl border border-white/10">
            {user.audit_log?.length > 0 ? (
              <div className="divide-y divide-white/5">{user.audit_log.map((entry: any, idx: number) => (
                <div key={idx} className="px-4 py-3 flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#0A6CF1] shrink-0" />
                  <div><p className="text-sm text-white">{actionLabels[entry.action] || entry.action}</p><p className="text-xs text-gray-500">{entry.timestamp ? new Date(entry.timestamp).toLocaleString("ar-EG") : ""}</p>{entry.details && <p className="text-xs text-gray-500 mt-0.5">{typeof entry.details === "string" ? entry.details : JSON.stringify(entry.details)}</p>}</div>
                </div>
              ))}</div>
            ) : <p className="text-center py-6 text-gray-500 text-sm">لا يوجد نشاطات</p>}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => { confirmAction?.onConfirm(); setConfirmAction(null); }}
        title={confirmAction?.title || ""}
        message={confirmAction?.message || ""}
        variant="danger"
      />
    </div>
  );
}
