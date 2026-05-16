"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const statusColor: Record<string, string> = { paid: "bg-green-500/20 text-green-400", pending: "bg-yellow-500/20 text-yellow-400", overdue: "bg-red-500/20 text-red-400", cancelled: "bg-gray-500/20 text-gray-400", refunded: "bg-purple-500/20 text-purple-400" };
const statusLabel: Record<string, string> = { paid: "مدفوعة", pending: "معلقة", overdue: "متأخرة", cancelled: "ملغية", refunded: "مسترجع" };

function InvoicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ user_id: "", plan: "monthly", amount: 500, due_date: "" });
  const [createError, setCreateError] = useState("");

  useEffect(() => { document.title = "كل الفواتير - Sky ERP"; fetchInvoices(); }, [page, statusFilter]);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const userId = searchParams.get("user_id");
      if (userId) params.set("user_id", userId);
      const res = await fetch(`/api/admin/billing/invoices?${params}`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setInvoices(data.invoices || []);
      setTotalPages(data.pagination?.total_pages || 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    try {
      const res = await fetch("/api/admin/billing/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(createForm) });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error || "حدث خطأ"); return; }
      setShowCreateModal(false);
      setCreateForm({ user_id: "", plan: "monthly", amount: 500, due_date: "" });
      fetchInvoices();
    } catch { setCreateError("حدث خطأ"); }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><Link href="/admin/billing" className="text-gray-400 text-sm hover:text-white transition">← العودة</Link><h1 className="text-2xl font-bold text-white mt-1">كل الفواتير</h1></div>
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2.5 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer">+ إنشاء فاتورة</button>
        </div>

        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="mb-4 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#0A6CF1]">
          <option value="all">كل الحالات</option>
          <option value="paid">مدفوعة</option><option value="pending">معلقة</option><option value="overdue">متأخرة</option><option value="cancelled">ملغية</option>
        </select>

        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10">
                {["رقم الفاتورة", "المستخدم", "الخطة", "المبلغ", "الحالة", "تاريخ الإصدار", "تاريخ الاستحقاق", ""].map((h) => <th key={h} className="text-right px-4 py-3 text-gray-400 font-medium">{h}</th>)}
              </tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={8} className="text-center py-12 text-gray-500">جاري التحميل...</td></tr>
                : invoices.length === 0 ? <tr><td colSpan={8} className="text-center py-12 text-gray-500">لا توجد فواتير</td></tr>
                : invoices.map((inv: any) => (
                  <tr key={inv._id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3"><Link href={`/admin/billing/invoices/${inv._id}`} className="text-[#0A6CF1] hover:underline font-medium">{inv.invoice_number}</Link></td>
                    <td className="px-4 py-3 text-gray-400">{inv.username}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{inv.plan}</td>
                    <td className="px-4 py-3 text-white">{inv.amount} {inv.currency}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded ${statusColor[inv.status] || "bg-gray-500/20 text-gray-400"}`}>{statusLabel[inv.status] || inv.status}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{inv.issued_date ? new Date(inv.issued_date).toLocaleDateString("ar-EG") : "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{inv.due_date ? new Date(inv.due_date).toLocaleDateString("ar-EG") : "—"}</td>
                    <td className="px-4 py-3 text-center"><Link href={`/admin/billing/invoices/${inv._id}`} className="text-xs text-[#0A6CF1] hover:underline">تفاصيل</Link></td>
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
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-white">إنشاء فاتورة جديدة</h2><button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white cursor-pointer text-xl">✕</button></div>
            {createError && <div className="bg-red-500/10 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">{createError}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="block text-xs text-gray-400 mb-1">معرف المستخدم *</label><input type="text" value={createForm.user_id} onChange={(e) => setCreateForm({ ...createForm, user_id: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" required dir="ltr" placeholder="MongoDB ID" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-gray-400 mb-1">الخطة</label><select value={createForm.plan} onChange={(e) => setCreateForm({ ...createForm, plan: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm"><option value="monthly">شهري</option><option value="half_yearly">نصف سنوي</option><option value="yearly">سنوي</option><option value="lifetime">دائم</option></select></div>
                <div><label className="block text-xs text-gray-400 mb-1">المبلغ *</label><input type="number" value={createForm.amount} onChange={(e) => setCreateForm({ ...createForm, amount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" required min={1} /></div>
              </div>
              <div><label className="block text-xs text-gray-400 mb-1">تاريخ الاستحقاق</label><input type="date" value={createForm.due_date} onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" /></div>
              <button type="submit" className="w-full py-2.5 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer mt-2">إنشاء الفاتورة</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminInvoicesPage() {
  return <Suspense fallback={<div className="p-6 text-center text-gray-500">جاري التحميل...</div>}><InvoicesContent /></Suspense>;
}
