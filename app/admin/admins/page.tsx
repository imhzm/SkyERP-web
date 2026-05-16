"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "../layout";
import { TableSkeleton } from "@/components/admin/LoadingSkeleton";
import { ConfirmDialog } from "@/components/admin/Modal";

interface AdminUser {
  id: string; email: string; full_name: string; role: string;
  permissions: any; is_active: boolean; notes: string;
  last_login: string | null; created_at: string; login_attempts: number;
}

const roleLabels: Record<string, string> = { founder: "مؤسس", super_admin: "مدير عام", admin: "مشرف", support: "دعم فني" };

export default function AdminAdminsPage() {
  const { admin } = useAdmin();
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", password: "", full_name: "", role: "admin", notes: "", permissions: { can_manage_users: false, can_manage_billing: false, can_view_audit: false, can_manage_admins: false, can_manage_settings: false } });
  const [createError, setCreateError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => { document.title = "إدارة المشرفين - Sky ERP"; if (admin?.role !== "founder") router.push("/admin/dashboard"); else fetchAdmins(); }, [page, roleFilter, search]);

  async function fetchAdmins() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (roleFilter !== "all") params.set("role", roleFilter);
      const res = await fetch(`/api/admin/admins?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setAdmins(data.admins);
      setTotalPages(data.pagination.total_pages);
      setTotal(data.pagination.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    try {
      const res = await fetch("/api/admin/admins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(createForm) });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error || "حدث خطأ"); return; }
      setShowCreate(false);
      setCreateForm({ email: "", password: "", full_name: "", role: "admin", notes: "", permissions: { can_manage_users: false, can_manage_billing: false, can_view_audit: false, can_manage_admins: false, can_manage_settings: false } });
      fetchAdmins();
    } catch { setCreateError("حدث خطأ"); }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
      setConfirmDelete(null);
      fetchAdmins();
    } catch { setConfirmDelete(null); }
  }

  async function toggleActive(adminId: string, currentActive: boolean) {
    await fetch(`/api/admin/admins/${adminId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !currentActive }) });
    fetchAdmins();
  }

  const isFounder = admin?.role === "founder";
  if (!isFounder) return null;

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">إدارة المشرفين</h1>
            <p className="text-gray-500 text-sm">إجمالي: {total} مشرف</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2.5 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer">+ إضافة مشرف</button>
        </div>

        <div className="flex gap-3 mb-4">
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] text-sm" placeholder="بحث بالبريد أو الاسم..." />
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm">
            <option value="all">كل الأدوار</option>
            <option value="super_admin">مدير عام</option><option value="admin">مشرف</option><option value="support">دعم فني</option>
          </select>
        </div>

        {loading ? <TableSkeleton rows={5} cols={7} /> : (
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">المشرف</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">الدور</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">الحالة</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">آخر دخول</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">تاريخ الإنشاء</th>
                  <th className="text-center px-4 py-3 text-gray-400 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-gray-500">لا يوجد مشرفين</td></tr>
                : admins.map((a) => (
                  <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{a.full_name || a.email}</p>
                      <p className="text-gray-500 text-xs">{a.email}</p>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${a.role === "founder" ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-gray-300"}`}>{roleLabels[a.role] || a.role}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs ${a.is_active ? "text-green-400" : "text-red-400"}`}>{a.is_active ? "نشط" : "موقوف"}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{a.last_login ? new Date(a.last_login).toLocaleDateString("ar-EG") : "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(a.created_at).toLocaleDateString("ar-EG")}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/admins/${a.id}`} className="text-xs text-[#0A6CF1] hover:underline">تفاصيل</Link>
                        {a.role !== "founder" && (
                          <>
                            <button onClick={() => toggleActive(a.id, a.is_active)} className={`text-xs cursor-pointer ${a.is_active ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"}`}>{a.is_active ? "تعطيل" : "تفعيل"}</button>
                            <button onClick={() => setConfirmDelete({ id: a.id, name: a.full_name || a.email })} className="text-xs text-red-400 hover:text-red-300 cursor-pointer">حذف</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-white/10">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-400 disabled:opacity-30 cursor-pointer">السابق</button>
              <span className="text-sm text-gray-400">{page} / {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-400 disabled:opacity-30 cursor-pointer">التالي</button>
            </div>
          )}
        </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-white">إضافة مشرف جديد</h2><button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white text-xl cursor-pointer">✕</button></div>
            {createError && <div className="bg-red-500/10 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">{createError}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="block text-xs text-gray-400 mb-1">البريد الإلكتروني *</label><input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" required dir="ltr" /></div>
              <div><label className="block text-xs text-gray-400 mb-1">الاسم كامل *</label><input type="text" value={createForm.full_name} onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" required /></div>
              <div><label className="block text-xs text-gray-400 mb-1">كلمة المرور *</label><input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" required minLength={8} /></div>
              <div><label className="block text-xs text-gray-400 mb-1">الدور</label><select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm"><option value="super_admin">مدير عام</option><option value="admin">مشرف</option><option value="support">دعم فني</option></select></div>
              <div><label className="block text-xs text-gray-400 mb-1">ملاحظات</label><input type="text" value={createForm.notes} onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></div>
              <div className="border-t border-white/10 pt-3"><p className="text-xs text-gray-400 mb-2">الصلاحيات</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "can_manage_users", label: "إدارة المستخدمين" },
                    { key: "can_manage_billing", label: "إدارة الفواتير" },
                    { key: "can_view_audit", label: "عرض النشاطات" },
                    { key: "can_manage_settings", label: "الإعدادات" },
                  ].map((p) => (
                    <label key={p.key} className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={(createForm.permissions as any)[p.key]} onChange={(e) => setCreateForm({ ...createForm, permissions: { ...createForm.permissions, [p.key]: e.target.checked } })} className="rounded border-white/20 bg-white/5" />{p.label}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer mt-2">إنشاء المشرف</button>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete.id)}
        title="حذف المشرف"
        message={`هل أنت متأكد من حذف ${confirmDelete?.name}؟ لا يمكن التراجع عن هذا الإجراء.`}
        variant="danger"
      />
    </div>
  );
}
