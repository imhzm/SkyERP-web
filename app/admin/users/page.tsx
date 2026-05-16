"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TableSkeleton } from "@/components/admin/LoadingSkeleton";
import { ConfirmDialog } from "@/components/admin/Modal";

interface User {
  id: string; username: string; email: string; full_name: string; role: string;
  account_type: string; owner_id: string | null; serial_number: string | null;
  team_members: number; max_team_members: number; company_name: string | null; tags: string[];
  is_active: boolean; activation_status: string; subscription_plan: string;
  subscription_end: string | null; has_hardware_binding: boolean;
  last_login: string | null; created_at: string; phone: string | null; email_verified: boolean;
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-400", suspended: "bg-red-500/20 text-red-400",
  expired: "bg-yellow-500/20 text-yellow-400", trial: "bg-blue-500/20 text-blue-400",
};
const statusLabels: Record<string, string> = { active: "نشط", suspended: "معلق", expired: "منتهي", trial: "تجريبي" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [accountTypeFilter, setAccountTypeFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState("suspend");
  const [createForm, setCreateForm] = useState({ username: "", email: "", phone: "", password: "", full_name: "", account_type: "client", owner_id: "", company_name: "", plan: "monthly", subscription_days: 30, max_team_members: 0, desktop_role: "" });
  const [createError, setCreateError] = useState("");
  const [confirmBulk, setConfirmBulk] = useState<{ action: string; onConfirm: () => void } | null>(null);

  useEffect(() => { document.title = "المستخدمين - Sky ERP"; fetchUsers(); }, [page, statusFilter, accountTypeFilter, roleFilter, search]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", status: statusFilter, account_type: accountTypeFilter, role: roleFilter, sort_by: "created_at", sort_order: "desc" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setUsers(data.users);
      setTotalPages(data.pagination.total_pages);
      setTotal(data.pagination.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    try {
      const body = {
        ...createForm,
        role: createForm.account_type === "sub_user" ? "sub_user" : "client",
        account_type: createForm.account_type,
        owner_id: createForm.owner_id || null,
        company_name: createForm.company_name || null,
        desktop_role: createForm.desktop_role || null,
      };
      const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error || "حدث خطأ"); return; }
      setShowCreateModal(false);
      setCreateForm({ username: "", email: "", phone: "", password: "", full_name: "", account_type: "client", owner_id: "", company_name: "", plan: "monthly", subscription_days: 30, max_team_members: 0, desktop_role: "" });
      fetchUsers();
    } catch { setCreateError("حدث خطأ"); }
  }

  async function toggleStatus(userId: string, currentActive: boolean) {
    await fetch(`/api/admin/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !currentActive }) });
    fetchUsers();
  }

  async function executeBulkAction() {
    const ids = Array.from(selected);
    const actionMap: Record<string, { method: string; body: any }> = {
      suspend: { method: "PATCH", body: { is_active: false, activation_status: "suspended" } },
      activate: { method: "PATCH", body: { is_active: true, activation_status: "active" } },
      delete: { method: "DELETE", body: null },
    };
    const { method, body } = actionMap[bulkAction];
    setConfirmBulk({
      action: bulkAction,
      onConfirm: async () => {
        await Promise.all(ids.map((id) =>
          fetch(`/api/admin/users/${id}`, { method, headers: body ? { "Content-Type": "application/json" } : {}, ...(body ? { body: JSON.stringify(body) } : {}) })
        ));
        setSelected(new Set());
        setShowBulkModal(false);
        setConfirmBulk(null);
        fetchUsers();
      },
    });
  }

  function toggleAll() { setSelected(selected.size === users.length ? new Set() : new Set(users.map((u) => u.id))); }

  function csvExport() {
    const rows = ["الاسم,اسم المستخدم,البريد,الدور,الحالة,الخطة,آخر دخول", ...users.map((u) => `"${u.full_name || ""}","${u.username}","${u.email}","${u.role}","${u.activation_status}","${u.subscription_plan}","${u.last_login || ""}"`)].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + rows], { type: "text/csv;charset=utf-8;" }));
    a.download = "users.csv"; a.click();
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">إدارة المستخدمين</h1>
            <p className="text-gray-500 text-sm">إجمالي: {total} مستخدم</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={csvExport} className="px-3 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition cursor-pointer">تصدير CSV</button>
            <button onClick={() => setShowCreateModal(true)} className="px-4 py-2.5 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer">+ إضافة مستخدم</button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] text-sm" placeholder="بحث..." />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#0A6CF1]">
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option><option value="suspended">معلق</option><option value="trial">تجريبي</option><option value="expired">منتهي</option>
          </select>
          <select value={accountTypeFilter} onChange={(e) => { setAccountTypeFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#0A6CF1]">
            <option value="all">كل الأنواع</option>
            <option value="client">عميل رئيسي</option><option value="sub_user">عضو فريق</option>
          </select>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#0A6CF1]">
            <option value="all">كل الأدوار</option>
            <option value="client">عميل</option><option value="sub_user">مستخدم تابع</option>
          </select>
          {selected.size > 0 && <button onClick={() => setShowBulkModal(true)} className="px-4 py-2.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg text-sm hover:bg-orange-500/20 transition cursor-pointer">إجراء على {selected.size}</button>}
        </div>

        {loading ? <TableSkeleton rows={6} cols={9} /> : (
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 w-10"><input type="checkbox" checked={selected.size === users.length && users.length > 0} onChange={toggleAll} className="rounded border-white/20 bg-white/5" /></th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">المستخدم</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">الرقم التسلسلي</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">النوع</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">الحالة</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">الخطة</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">الفريق</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">الجهاز</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">آخر دخول</th>
                  <th className="text-center px-4 py-3 text-gray-400 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? <tr><td colSpan={10} className="text-center py-12 text-gray-500">لا يوجد مستخدمين</td></tr>
                : users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3"><input type="checkbox" checked={selected.has(user.id)} onChange={() => { const n = new Set(selected); n.has(user.id) ? n.delete(user.id) : n.add(user.id); setSelected(n); }} className="rounded border-white/20 bg-white/5" /></td>
                    <td className="px-4 py-3"><Link href={`/admin/users/${user.id}`} className="text-white hover:text-[#0A6CF1] transition font-medium">{user.full_name || user.username}</Link><p className="text-gray-500 text-xs">{user.email}</p></td>
                    <td className="px-4 py-3"><span className="text-xs font-mono text-gray-400" dir="ltr">{user.serial_number || "—"}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${user.account_type === "sub_user" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>{user.account_type === "sub_user" ? "تابع" : "رئيسي"}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${statusColors[user.activation_status] || "bg-gray-500/20 text-gray-400"}`}>{statusLabels[user.activation_status] || user.activation_status}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-400">{user.subscription_plan}</span>{user.subscription_end && <p className="text-xs text-gray-500">{new Date(user.subscription_end).toLocaleDateString("ar-EG")}</p>}</td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-400">{user.account_type === "client" ? `${user.team_members || 0}/${user.max_team_members || 0}` : "—"}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs ${user.has_hardware_binding ? "text-green-400" : "text-gray-500"}`}>{user.has_hardware_binding ? "مقيد" : "غير مقيد"}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{user.last_login ? new Date(user.last_login).toLocaleDateString("ar-EG") : "—"}</td>
                    <td className="px-4 py-3"><div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/users/${user.id}`} className="text-xs text-[#0A6CF1] hover:underline">تفاصيل</Link>
                      <button onClick={() => toggleStatus(user.id, user.is_active)} className={`text-xs cursor-pointer ${user.is_active ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"}`}>{user.is_active ? "تعليق" : "تفعيل"}</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-white/10">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-400 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">السابق</button>
              <span className="text-sm text-gray-400">{page} / {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-400 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">التالي</button>
            </div>
          )}
        </div>
        )}</div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-white">إضافة مستخدم جديد</h2><button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white cursor-pointer text-xl">✕</button></div>
            {createError && <div className="bg-red-500/10 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">{createError}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-gray-400 mb-1">اسم المستخدم *</label><input type="text" value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" required /></div>
                <div><label className="block text-xs text-gray-400 mb-1">الاسم كامل *</label><input type="text" value={createForm.full_name} onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" required /></div>
              </div>
              <div><label className="block text-xs text-gray-400 mb-1">البريد الإلكتروني *</label><input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" required dir="ltr" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-gray-400 mb-1">كلمة المرور *</label><input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" required /></div>
                <div><label className="block text-xs text-gray-400 mb-1">رقم الهاتف</label><input type="tel" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" dir="ltr" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs text-gray-400 mb-1">النوع</label><select value={createForm.account_type} onChange={(e) => setCreateForm({ ...createForm, account_type: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm"><option value="client">عميل رئيسي</option><option value="sub_user">مستخدم تابع</option></select></div>
                <div><label className="block text-xs text-gray-400 mb-1">الخطة</label><select value={createForm.plan} onChange={(e) => setCreateForm({ ...createForm, plan: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm"><option value="monthly">شهري</option><option value="half_yearly">نصف سنوي</option><option value="yearly">سنوي</option><option value="lifetime">دائم</option></select></div>
                <div><label className="block text-xs text-gray-400 mb-1">عدد الأيام</label><input type="number" value={createForm.subscription_days} onChange={(e) => setCreateForm({ ...createForm, subscription_days: parseInt(e.target.value) || 30 })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" min={1} /></div>
              </div>
              <div><label className="block text-xs text-gray-400 mb-1">الدور في البرنامج (اختياري)</label>
                <select value={createForm.desktop_role} onChange={(e) => setCreateForm({ ...createForm, desktop_role: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm">
                  <option value="">غير محدد</option><option value="admin">مدير</option><option value="accountant">محاسب</option><option value="sales">مبيعات</option><option value="employee">موظف</option>
                </select>
                <p className="text-gray-500 text-xs mt-1">إذا تم تحديد دور، سيتمكن المستخدم من تسجيل الدخول إلى برنامج الديسكتوب</p>
              </div>
              {createForm.account_type === "client" && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-gray-400 mb-1">اسم الشركة</label><input type="text" value={createForm.company_name} onChange={(e) => setCreateForm({ ...createForm, company_name: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" /></div>
                  <div><label className="block text-xs text-gray-400 mb-1">الحد الأقصى للفريق</label><input type="number" value={createForm.max_team_members} onChange={(e) => setCreateForm({ ...createForm, max_team_members: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" min={0} /></div>
                </div>
              )}
              <button type="submit" className="w-full py-2.5 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer mt-2">إنشاء المستخدم</button>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-white">إجراء على {selected.size} مستخدم</h2><button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-white cursor-pointer text-xl">✕</button></div>
            <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm mb-4">
              <option value="suspend">تعليق الحسابات</option><option value="activate">تفعيل الحسابات</option><option value="delete">حذف الحسابات</option>
            </select>
            <div className="flex gap-2">
              <button onClick={executeBulkAction} className="flex-1 py-2.5 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer">تأكيد</button>
              <button onClick={() => setShowBulkModal(false)} className="flex-1 py-2.5 bg-white/5 text-gray-400 rounded-lg text-sm hover:text-white transition cursor-pointer">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmBulk}
        onClose={() => setConfirmBulk(null)}
        onConfirm={() => { confirmBulk?.onConfirm(); }}
        title={confirmBulk?.action === "delete" ? "حذف المستخدمين" : "تأكيد الإجراء"}
        message={confirmBulk?.action === "delete" ? `هل أنت متأكد من حذف ${selected.size} مستخدم؟ لا يمكن التراجع عن هذا الإجراء.` : `هل أنت متأكد من ${confirmBulk?.action === "suspend" ? "تعليق" : "تفعيل"} ${selected.size} مستخدم؟`}
        variant={confirmBulk?.action === "delete" ? "danger" : "primary"}
      />
    </div>
  );
}
