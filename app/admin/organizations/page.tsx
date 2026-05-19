"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TableSkeleton } from "@/components/admin/LoadingSkeleton";
import { ConfirmDialog } from "@/components/admin/Modal";

interface Organization {
  id: string; name: string; slug: string; serial_number: string | null;
  owner: { id: string; username: string; email: string } | null;
  subscription: { plan: string; status: string; end_date: string | null };
  limits: { max_users: number; max_devices: number };
  is_active: boolean; admins_count: number;
  created_at: string; updated_at: string;
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-400", suspended: "bg-red-500/20 text-red-400",
  expired: "bg-yellow-500/20 text-yellow-400", trial: "bg-blue-500/20 text-blue-400",
};
const planLabels: Record<string, string> = { trial: "تجريبي", monthly: "شهري", half_yearly: "نصف سنوي", yearly: "سنوي", lifetime: "دائم" };

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", slug: "", owner_user_id: "", company_name: "", company_phone: "", company_email: "" });
  const [createError, setCreateError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => { document.title = "المنظمات - Sky ERP"; fetchOrgs(); }, [page, statusFilter, search]);

  async function fetchOrgs() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", status: statusFilter, sort_by: "created_at", sort_order: "desc" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/organizations?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setOrgs(data.organizations);
      setTotalPages(data.pagination.total_pages);
      setTotal(data.pagination.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    try {
      const body: Record<string, any> = { name: createForm.name, owner_user_id: createForm.owner_user_id };
      if (createForm.slug) body.slug = createForm.slug;
      if (createForm.company_name) body.company_name = createForm.company_name;
      if (createForm.company_phone) body.company_phone = createForm.company_phone;
      if (createForm.company_email) body.company_email = createForm.company_email;
      const res = await fetch("/api/admin/organizations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error || "حدث خطأ"); return; }
      setShowCreateModal(false);
      setCreateForm({ name: "", slug: "", owner_user_id: "", company_name: "", company_phone: "", company_email: "" });
      fetchOrgs();
    } catch { setCreateError("حدث خطأ"); }
  }

  async function toggleActive(orgId: string, currentActive: boolean) {
    await fetch(`/api/admin/organizations/${orgId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !currentActive }) });
    fetchOrgs();
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    await fetch(`/api/admin/organizations/${confirmDelete.id}`, { method: "DELETE" });
    setConfirmDelete(null);
    fetchOrgs();
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">إدارة المنظمات</h1>
            <p className="text-gray-500 text-sm">إجمالي: {total} منظمة</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2.5 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer">+ إضافة منظمة</button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] text-sm" placeholder="بحث بالاسم أو الرابط أو الرقم التسلسلي..." />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#0A6CF1]">
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option><option value="suspended">معلق</option><option value="trial">تجريبي</option><option value="expired">منتهي</option>
          </select>
        </div>

        {loading ? <TableSkeleton rows={6} cols={7} /> : (
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">المنظمة</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">المالك</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">الرقم التسلسلي</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">الحالة</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">الخطة</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">المشرفين</th>
                  <th className="text-center px-4 py-3 text-gray-400 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {orgs.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-gray-500">لا يوجد منظمات</td></tr>
                : orgs.map((org) => (
                  <tr key={org.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3"><Link href={`/admin/organizations/${org.id}`} className="text-white hover:text-[#0A6CF1] transition font-medium">{org.name}</Link><p className="text-gray-500 text-xs">{org.slug}</p></td>
                    <td className="px-4 py-3"><Link href={`/admin/users/${org.owner?.id}`} className="text-[#0A6CF1] hover:underline text-xs">{org.owner?.username || org.owner?.email || "—"}</Link></td>
                    <td className="px-4 py-3"><span className="text-xs font-mono text-gray-400" dir="ltr">{org.serial_number || "—"}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${statusColors[org.subscription?.status] || "bg-gray-500/20 text-gray-400"}`}>{org.subscription?.status || "—"}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-400">{planLabels[org.subscription?.plan] || org.subscription?.plan || "—"}</span>{org.subscription?.end_date && <p className="text-xs text-gray-500">{new Date(org.subscription.end_date).toLocaleDateString("ar-EG")}</p>}</td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-400">{org.admins_count || 0}</span></td>
                    <td className="px-4 py-3"><div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/organizations/${org.id}`} className="text-xs text-[#0A6CF1] hover:underline">تفاصيل</Link>
                      <button onClick={() => toggleActive(org.id, org.is_active)} className={`text-xs cursor-pointer ${org.is_active ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"}`}>{org.is_active ? "تعليق" : "تفعيل"}</button>
                      <button onClick={() => setConfirmDelete({ id: org.id, name: org.name })} className="text-xs text-red-400 hover:text-red-300 cursor-pointer">حذف</button>
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
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-white">إضافة منظمة جديدة</h2><button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white cursor-pointer text-xl">✕</button></div>
            {createError && <div className="bg-red-500/10 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">{createError}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="block text-xs text-gray-400 mb-1">اسم المنظمة *</label><input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-gray-400 mb-1">الرابط (slug)</label><input type="text" value={createForm.slug} onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" placeholder="اختياري" dir="ltr" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">معرف المالك *</label><input type="text" value={createForm.owner_user_id} onChange={(e) => setCreateForm({ ...createForm, owner_user_id: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" required dir="ltr" placeholder="User ID" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-gray-400 mb-1">اسم الشركة</label><input type="text" value={createForm.company_name} onChange={(e) => setCreateForm({ ...createForm, company_name: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" /></div>
                <div><label className="block text-xs text-gray-400 mb-1">الهاتف</label><input type="tel" value={createForm.company_phone} onChange={(e) => setCreateForm({ ...createForm, company_phone: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" dir="ltr" /></div>
              </div>
              <div><label className="block text-xs text-gray-400 mb-1">البريد الإلكتروني للشركة</label><input type="email" value={createForm.company_email} onChange={(e) => setCreateForm({ ...createForm, company_email: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" dir="ltr" /></div>
              <button type="submit" className="w-full py-2.5 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer mt-2">إنشاء المنظمة</button>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="حذف المنظمة"
        message={`هل أنت متأكد من حذف "${confirmDelete?.name}"؟ سيتم إلغاء ربط المنظمة بجميع المستخدمين. لا يمكن التراجع عن هذا الإجراء.`}
        variant="danger"
      />
    </div>
  );
}
