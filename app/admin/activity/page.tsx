"use client";

import { useState, useEffect } from "react";
import { TableSkeleton } from "@/components/admin/LoadingSkeleton";

const actionLabels: Record<string, string> = {
  register: "تسجيل", login: "دخول", login_failed: "فشل دخول", logout: "خروج",
  password_change: "تغيير كلمة المرور", device_bind: "ربط جهاز", device_reset: "إعادة تعيين الجهاز",
  subscription_change: "تعديل اشتراك", admin_login: "دخول مشرف", admin_login_failed: "فشل دخول مشرف",
  admin_create_user: "إنشاء مستخدم", admin_update_user: "تعديل مستخدم", admin_delete_user: "حذف مستخدم",
  admin_reset_device: "إعادة جهاز", admin_update_subscription: "تعديل اشتراك",
  admin_lock_user: "قفل حساب", admin_unlock_user: "فتح حساب", admin_force_logout: "إنهاء جلسات",
  admin_mark_paid: "تسجيل دفع", admin_create_invoice: "إنشاء فاتورة",
  admin_create_plan: "إنشاء خطة", admin_update_plan: "تعديل خطة",
  admin_change_password: "تغيير كلمة مرور المشرف",
};
  const collectionLabels: Record<string, string> = { users: "المستخدمين", admin: "المشرفين", invoices: "الفواتير", plans: "الخطط", audit_log: "سجل النشاطات" };
  const roleLabels: Record<string, string> = { founder: "مؤسس", super_admin: "مشرف عام", admin: "مشرف", support: "دعم", client: "عميل", sub_user: "مستخدم تابع" };
  const roleColors: Record<string, string> = { founder: "bg-amber-500/20 text-amber-400", super_admin: "bg-red-500/20 text-red-400", admin: "bg-blue-500/20 text-blue-400", support: "bg-purple-500/20 text-purple-400", client: "bg-green-500/20 text-green-400", sub_user: "bg-gray-500/20 text-gray-400" };

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => { document.title = "سجل النشاطات - Sky ERP"; fetchLogs(); }, [page, actionFilter, collectionFilter, search]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "30" });
      if (actionFilter) params.set("action", actionFilter);
      if (collectionFilter) params.set("target_collection", collectionFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/audit-logs?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setLogs(data.logs || []);
      setActionTypes(data.action_types || []);
      setCollections(data.collections || []);
      setTotalPages(data.pagination?.total_pages || 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function csvExport() {
    const header = "الإجراء,المجموعة,المستخدم,IP,التفاصيل,التاريخ,النجاح";
    const rows = logs.map((l: any) =>
      `"${actionLabels[l.action] || l.action}","${collectionLabels[l.target_collection] || l.target_collection}","${l.performed_by || ""}","${l.ip_address || ""}","${l.details ? (typeof l.details === "string" ? l.details : JSON.stringify(l.details)) : ""}","${l.timestamp ? new Date(l.timestamp).toISOString() : ""}","${l.success ? "نعم" : "لا"}"`
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" }));
    a.download = "audit-logs.csv"; a.click();
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-white">سجل النشاطات</h1><p className="text-gray-500 text-sm">جميع الأحداث في النظام</p></div>
          <div className="flex items-center gap-2">
            <button onClick={csvExport} className="px-3 py-1.5 text-xs text-gray-400 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer">تصدير CSV</button>
            <button onClick={fetchLogs} className="px-3 py-1.5 text-xs text-gray-400 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer">تحديث</button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] text-sm" placeholder="بحث..." />
          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#0A6CF1]">
            <option value="">كل الإجراءات</option>
            {actionTypes.map((a) => <option key={a} value={a}>{actionLabels[a] || a}</option>)}
          </select>
          <select value={collectionFilter} onChange={(e) => { setCollectionFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#0A6CF1]">
            <option value="">كل المجموعات</option>
            {collections.map((c) => <option key={c} value={c}>{collectionLabels[c] || c}</option>)}
          </select>
        </div>

        {loading ? <TableSkeleton rows={6} cols={5} /> : logs.length === 0 ? (
          <div className="bg-white/5 rounded-xl border border-white/10 text-center py-12 text-gray-500">لا توجد نشاطات</div>
        ) : (
          <div className="bg-white/5 rounded-xl border border-white/10">
            <div className="divide-y divide-white/5">
              {logs.map((log: any) => (
                <div key={log._id} className="px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition">
                  <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${log.success ? "bg-green-500" : "bg-red-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-white">{actionLabels[log.action] || log.action}</p>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-gray-400">{collectionLabels[log.target_collection] || log.target_collection}</span>
                      {log.actor_role && <span className={`text-xs px-1.5 py-0.5 rounded ${roleColors[log.actor_role] || "bg-gray-500/20 text-gray-400"}`}>{roleLabels[log.actor_role] || log.actor_role}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{log.performed_by} · {log.ip_address || "—"}{log.target_username && ` · ${log.target_username}`}</p>
                    {log.details && <p className="text-xs text-gray-600 mt-0.5">{typeof log.details === "string" ? log.details : JSON.stringify(log.details).substring(0, 120)}</p>}
                  </div>
                  <div className="text-xs text-gray-500 shrink-0">{log.timestamp ? new Date(log.timestamp).toLocaleString("ar-EG") : ""}</div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-white/10">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-400 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">السابق</button>
                <span className="text-sm text-gray-400">{page} / {totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-400 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">التالي</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
