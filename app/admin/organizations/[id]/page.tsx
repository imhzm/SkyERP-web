"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ConfirmDialog } from "@/components/admin/Modal";

interface OrgDetail {
  id: string; name: string; slug: string; serial_number: string | null;
  owner: { id: string; username: string; email: string; full_name: string; phone: string } | null;
  admins: { user_id: string; username: string; email: string; full_name: string; role: "owner" | "admin"; added_at: string }[];
  settings: Record<string, any>;
  subscription: { plan: string; status: string; start_date: string | null; end_date: string | null; auto_renew: boolean; grace_period_end: string | null; trial_start: string | null; trial_end: string | null };
  limits: { max_users: number; max_devices: number };
  is_active: boolean;
  settings_last_modified: string | null;
  created_at: string; updated_at: string;
}

const planLabels: Record<string, string> = { trial: "تجريبي", monthly: "شهري", half_yearly: "نصف سنوي", yearly: "سنوي", lifetime: "دائم" };

export default function AdminOrgDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;
  const [org, setOrg] = useState<OrgDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("info");
  const [message, setMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [editForm, setEditForm] = useState({ name: "", is_active: true, max_users: 1, max_devices: 1 });
  const [settingsForm, setSettingsForm] = useState<Record<string, any>>({});
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [subForm, setSubForm] = useState({ plan: "", end_date: "", auto_renew: false });

  useEffect(() => { document.title = "تفاصيل المنظمة - Sky ERP"; fetchOrg(); }, [orgId]);

  async function fetchOrg() {
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setOrg(data.organization);
      setEditForm({
        name: data.organization.name || "",
        is_active: data.organization.is_active,
        max_users: data.organization.limits?.max_users || 1,
        max_devices: data.organization.limits?.max_devices || 1,
      });
      setSettingsForm(data.organization.settings || {});
      const sub = data.organization.subscription || {};
      setSubForm({
        plan: sub.plan || "trial",
        end_date: sub.end_date ? new Date(sub.end_date).toISOString().split("T")[0] : "",
        auto_renew: sub.auto_renew || false,
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function saveOrg(body: any, method = "PATCH") {
    setMessage("");
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error || "حدث خطأ"); return; }
      setMessage("تم الحفظ");
      fetchOrg();
    } catch { setMessage("حدث خطأ"); }
  }

  async function saveSettings() {
    setMessage("");
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: settingsForm }) });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error || "حدث خطأ"); return; }
      setMessage("تم حفظ الإعدادات");
      setSettingsChanged(false);
      fetchOrg();
    } catch { setMessage("حدث خطأ"); }
  }

  async function deleteOrg() {
    setMessage("");
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error || "حدث خطأ"); return; }
      setMessage(data.message);
      setTimeout(() => router.push("/admin/organizations"), 1500);
    } catch { setMessage("حدث خطأ"); }
  }

  if (loading) return <div className="p-6 text-center text-gray-500">جاري التحميل...</div>;
  if (!org) return <div className="p-6 text-center text-gray-500">المنظمة غير موجودة</div>;

  const subStatusColor: Record<string, string> = { active: "text-green-400", suspended: "text-red-400", expired: "text-yellow-400", trial: "text-blue-400" };

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/organizations" className="text-gray-400 text-sm hover:text-white transition">← العودة للمنظمات</Link>

        <div className="flex items-start justify-between mt-2 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{org.name}</h1>
            <p className="text-gray-400 text-sm">{org.slug} · <span className={subStatusColor[org.subscription?.status] || "text-gray-400"}>{org.subscription?.status}</span></p>
          </div>
          <button onClick={() => setConfirmAction({ title: "حذف المنظمة", message: `هل أنت متأكد من حذف "${org.name}"؟ سيتم إلغاء ربط المنظمة بجميع المستخدمين. لا يمكن التراجع عن هذا الإجراء.`, onConfirm: deleteOrg })} className="px-3 py-1.5 text-xs border border-red-500/20 text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition cursor-pointer">حذف المنظمة</button>
        </div>

        {message && <div className={`${message === "حدث خطأ" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"} rounded-lg px-4 py-3 mb-4 text-sm`}>{message}</div>}

        <div className="flex gap-1 mb-6 bg-white/5 rounded-lg p-1 overflow-x-auto">
          {[
            { k: "info", l: "المعلومات" },
            { k: "settings", l: "الإعدادات" },
            { k: "subscription", l: "الاشتراك" },
            { k: "team", l: "المشرفين" },
          ].map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)} className={`flex-1 py-2 text-sm rounded-md transition cursor-pointer whitespace-nowrap ${tab === t.k ? "bg-[#0A6CF1] text-white" : "text-gray-400 hover:text-white"}`}>{t.l}</button>
          ))}
        </div>

        {/* Info */}
        {tab === "info" && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[
                { label: "الاسم", value: org.name },
                { label: "الرابط (slug)", value: org.slug },
                { label: "الرقم التسلسلي", value: org.serial_number ? <span className="font-mono text-xs" dir="ltr">{org.serial_number}</span> : "—" },
                { label: "الحالة", value: <span className={org.is_active ? "text-green-400" : "text-red-400"}>{org.is_active ? "نشط" : "موقوف"}</span> },
                { label: "المالك", value: org.owner ? <Link href={`/admin/users/${org.owner.id}`} className="text-[#0A6CF1] hover:underline">{org.owner.full_name || org.owner.username}</Link> : "—" },
                { label: "بريد المالك", value: org.owner?.email || "—" },
                { label: "الحد الأقصى للمستخدمين", value: org.limits?.max_users },
                { label: "الحد الأقصى للأجهزة", value: org.limits?.max_devices },
                { label: "عدد المشرفين", value: org.admins?.length || 0 },
                { label: "تاريخ الإنشاء", value: new Date(org.created_at).toLocaleDateString("ar-EG") },
                { label: "آخر تحديث", value: new Date(org.updated_at).toLocaleDateString("ar-EG") },
              ].map((f: any) => (
                <div key={f.label}><p className="text-xs text-gray-500 mb-1">{f.label}</p><p className="text-white">{f.value}</p></div>
              ))}
            </div>
            <div className="mt-6 border-t border-white/10 pt-4">
              <h3 className="text-sm font-medium text-white mb-3">تعديل</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><label className="block text-xs text-gray-400 mb-1">الاسم</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">الحد الأقصى للمستخدمين</label><input type="number" value={editForm.max_users} onChange={(e) => setEditForm({ ...editForm, max_users: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" min={1} /></div>
                <div><label className="block text-xs text-gray-400 mb-1">الحد الأقصى للأجهزة</label><input type="number" value={editForm.max_devices} onChange={(e) => setEditForm({ ...editForm, max_devices: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" min={1} /></div>
                <div className="flex items-end pb-2"><label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer"><input type="checkbox" checked={editForm.is_active} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })} className="rounded border-white/20 bg-white/5" />نشط</label></div>
              </div>
              <button onClick={() => saveOrg({ name: editForm.name, is_active: editForm.is_active, limits: { max_users: editForm.max_users, max_devices: editForm.max_devices } })} className="mt-3 px-4 py-2 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer">حفظ</button>
            </div>
          </div>
        )}

        {/* Settings */}
        {tab === "settings" && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h3 className="text-sm font-medium text-white mb-4">إعدادات الشركة</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { k: "company_name", l: "اسم الشركة", t: "text" },
                { k: "company_tagline", l: "الشعار", t: "text" },
                { k: "company_address", l: "العنوان", t: "text" },
                { k: "company_phone", l: "الهاتف", t: "text" },
                { k: "company_email", l: "البريد الإلكتروني", t: "email" },
                { k: "default_tax_rate", l: "نسبة الضريبة (%)", t: "number" },
                { k: "bank_name", l: "اسم البنك", t: "text" },
                { k: "bank_account", l: "رقم الحساب", t: "text" },
                { k: "vodafone_cash", l: "فودافون كاش", t: "text" },
                { k: "default_notes", l: "الملاحظات الافتراضية", t: "text" },
                { k: "print_client_logo_width_px", l: "عرض الشعار (px)", t: "number" },
                { k: "print_client_logo_max_height_px", l: "ارتفاع الشعار الأقصى (px)", t: "number" },
                { k: "hr_payroll_days_divisor", l: "مقسوم أيام الرواتب", t: "number" },
                { k: "hr_standard_work_hours_per_day", l: "ساعات العمل القياسية", t: "number" },
                { k: "hr_overtime_rate_multiplier", l: "مضاعف overtime", t: "number" },
                { k: "hr_workday_start_time", l: "وقت بدء العمل", t: "text" },
                { k: "hr_workday_end_time", l: "وقت انتهاء العمل", t: "text" },
                { k: "hr_late_grace_minutes", l: "دقائق سماح التأخير", t: "number" },
                { k: "hr_early_leave_grace_minutes", l: "دقائق سماح الانصراف المبكر", t: "number" },
              ].map((f) => (
                <div key={f.k}>
                  <label className="block text-xs text-gray-400 mb-1">{f.l}</label>
                  <input type={f.t} value={settingsForm[f.k] ?? ""} onChange={(e) => { setSettingsForm({ ...settingsForm, [f.k]: f.t === "number" ? parseFloat(e.target.value) || 0 : e.target.value }); setSettingsChanged(true); }}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" dir={f.t === "email" ? "ltr" : "rtl"} />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-xs text-gray-400 mb-2">أيام الإجازة الأسبوعية</label>
              <div className="flex flex-wrap gap-3">
                {["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"].map((day, idx) => (
                  <label key={idx} className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                    <input type="checkbox" checked={(settingsForm.hr_weekend_days || []).includes(idx)}
                      onChange={() => { const days: number[] = settingsForm.hr_weekend_days || []; const n = days.includes(idx) ? days.filter((d) => d !== idx) : [...days, idx]; setSettingsForm({ ...settingsForm, hr_weekend_days: n }); setSettingsChanged(true); }}
                      className="rounded border-white/20 bg-white/5" />
                    {day}
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input type="checkbox" checked={settingsForm.hr_missing_attendance_counts_as_absence ?? true}
                  onChange={(e) => { setSettingsForm({ ...settingsForm, hr_missing_attendance_counts_as_absence: e.target.checked }); setSettingsChanged(true); }}
                  className="rounded border-white/20 bg-white/5" />
                الحضور الناقص يعتبر غياب
              </label>
            </div>
            {settingsChanged && <button onClick={saveSettings} className="mt-4 px-4 py-2 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer">حفظ الإعدادات</button>}
          </div>
        )}

        {/* Subscription */}
        {tab === "subscription" && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div><p className="text-xs text-gray-500 mb-1">الحالة</p><p className={`${subStatusColor[org.subscription?.status || "trial"]} text-sm font-medium`}>{org.subscription?.status}</p></div>
              <div><p className="text-xs text-gray-500 mb-1">الخطة</p><p className="text-white text-sm">{planLabels[org.subscription?.plan] || org.subscription?.plan}</p></div>
              <div><p className="text-xs text-gray-500 mb-1">تاريخ البداية</p><p className="text-white text-sm">{org.subscription?.start_date ? new Date(org.subscription.start_date).toLocaleDateString("ar-EG") : "—"}</p></div>
              <div><p className="text-xs text-gray-500 mb-1">تاريخ الانتهاء</p><p className="text-white text-sm">{org.subscription?.end_date ? new Date(org.subscription.end_date).toLocaleDateString("ar-EG") : "—"}</p></div>
              {org.subscription?.grace_period_end && <div><p className="text-xs text-gray-500 mb-1">فترة السماح</p><p className="text-yellow-400 text-sm">{new Date(org.subscription.grace_period_end).toLocaleDateString("ar-EG")}</p></div>}
              <div><p className="text-xs text-gray-500 mb-1">التجديد التلقائي</p><p className="text-white text-sm">{org.subscription?.auto_renew ? "مفعل" : "غير مفعل"}</p></div>
            </div>
            <div className="border-t border-white/10 pt-4"><h3 className="text-sm font-medium text-white mb-3">تعديل الاشتراك</h3>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs text-gray-400 mb-1">الخطة</label><select value={subForm.plan} onChange={(e) => setSubForm({ ...subForm, plan: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#0A6CF1]"><option value="trial">تجريبي</option><option value="monthly">شهري</option><option value="half_yearly">نصف سنوي</option><option value="yearly">سنوي</option><option value="lifetime">دائم</option></select></div>
                <div><label className="block text-xs text-gray-400 mb-1">تاريخ الانتهاء</label><input type="date" value={subForm.end_date} onChange={(e) => setSubForm({ ...subForm, end_date: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" /></div>
                <div className="flex items-end pb-2"><label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer"><input type="checkbox" checked={subForm.auto_renew} onChange={(e) => setSubForm({ ...subForm, auto_renew: e.target.checked })} className="rounded border-white/20 bg-white/5" />تجديد تلقائي</label></div>
              </div>
              <button onClick={() => saveOrg({ subscription: { ...subForm, end_date: subForm.end_date ? new Date(subForm.end_date).toISOString() : null, start_date: org.subscription?.start_date ? new Date(org.subscription.start_date).toISOString() : undefined } })} className="mt-4 px-4 py-2 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer">حفظ التعديلات</button>
            </div>
          </div>
        )}

        {/* Team */}
        {tab === "team" && (
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h3 className="text-sm font-medium text-white mb-4">المشرفين ({org.admins?.length || 0})</h3>
            {!org.admins?.length ? (
              <p className="text-gray-500 text-sm text-center py-6">لا يوجد مشرفين</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-right px-3 py-2 text-gray-400 font-medium">الاسم</th>
                      <th className="text-right px-3 py-2 text-gray-400 font-medium">البريد</th>
                      <th className="text-right px-3 py-2 text-gray-400 font-medium">الدور</th>
                      <th className="text-right px-3 py-2 text-gray-400 font-medium">تاريخ الإضافة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {org.admins.map((a) => (
                      <tr key={a.user_id} className="border-b border-white/5">
                        <td className="px-3 py-2"><Link href={`/admin/users/${a.user_id}`} className="text-[#0A6CF1] hover:underline">{a.full_name || a.username}</Link></td>
                        <td className="px-3 py-2 text-gray-400 text-xs">{a.email}</td>
                        <td className="px-3 py-2"><span className={`text-xs px-1.5 py-0.5 rounded ${a.role === "owner" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>{a.role === "owner" ? "مالك" : "مشرف"}</span></td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{a.added_at ? new Date(a.added_at).toLocaleDateString("ar-EG") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
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
