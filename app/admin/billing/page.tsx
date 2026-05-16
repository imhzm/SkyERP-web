"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const invStatusColor: Record<string, string> = {
  paid: "bg-green-500/20 text-green-400", pending: "bg-yellow-500/20 text-yellow-400",
  overdue: "bg-red-500/20 text-red-400", cancelled: "bg-gray-500/20 text-gray-400", refunded: "bg-purple-500/20 text-purple-400",
};
const invStatusLabel: Record<string, string> = { paid: "مدفوعة", pending: "معلقة", overdue: "متأخرة", cancelled: "ملغية", refunded: "مسترجع" };

export default function AdminBillingPage() {
  const [stats, setStats] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "الفواتير - Sky ERP";
    Promise.all([
      fetch("/api/admin/stats").then(r => r.ok && r.json()).catch(() => {}),
      fetch("/api/admin/billing/invoices?limit=5").then(r => r.ok && r.json()).catch(() => {}),
    ]).then(([s, d]) => { setStats(s); setInvoices(d?.invoices || []); }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-white">الفواتير</h1><p className="text-gray-500 text-sm">إدارة الفواتير والاشتراكات</p></div>
          <div className="flex items-center gap-2">
            <Link href="/admin/billing/plans" className="px-3 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10 transition">إدارة الخطط</Link>
            <Link href="/admin/billing/invoices" className="px-4 py-2.5 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition">كل الفواتير</Link>
          </div>
        </div>

        {loading ? <div className="text-center py-12 text-gray-500">جاري التحميل...</div> : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl border border-white/10 p-4"><p className="text-gray-400 text-xs mb-1">إجمالي الإيرادات</p><p className="text-2xl font-bold text-white">{stats?.revenue?.total?.toLocaleString() || 0} ج.م</p></div>
              <div className="bg-white/5 rounded-xl border border-white/10 p-4"><p className="text-gray-400 text-xs mb-1">مدفوعة</p><p className="text-2xl font-bold text-green-400">{stats?.revenue?.invoices?.paid || 0}</p></div>
              <div className="bg-white/5 rounded-xl border border-white/10 p-4"><p className="text-gray-400 text-xs mb-1">متأخرة</p><p className="text-2xl font-bold text-red-400">{stats?.revenue?.invoices?.overdue || 0}</p></div>
              <div className="bg-white/5 rounded-xl border border-white/10 p-4"><p className="text-gray-400 text-xs mb-1">إجمالي الفواتير</p><p className="text-2xl font-bold text-white">{stats?.revenue?.invoices?.total || 0}</p></div>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
              <h2 className="text-sm font-bold text-white mb-4">آخر الفواتير</h2>
              {invoices.length === 0 ? <p className="text-gray-500 text-sm text-center py-6">لا توجد فواتير</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-white/10">
                      {["رقم الفاتورة", "المستخدم", "المبلغ", "الحالة", "تاريخ الاستحقاق", ""].map((h) => <th key={h} className="text-right px-3 py-2 text-gray-400 font-medium">{h}</th>)}
                    </tr></thead>
                    <tbody>{invoices.map((inv: any) => (
                      <tr key={inv._id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="px-3 py-2"><Link href={`/admin/billing/invoices/${inv._id}`} className="text-[#0A6CF1] hover:underline text-xs">{inv.invoice_number}</Link></td>
                        <td className="px-3 py-2 text-gray-400 text-xs">{inv.username}</td>
                        <td className="px-3 py-2 text-white text-xs">{inv.amount} {inv.currency}</td>
                        <td className="px-3 py-2"><span className={`text-xs px-1.5 py-0.5 rounded ${invStatusColor[inv.status] || "bg-gray-500/20 text-gray-400"}`}>{invStatusLabel[inv.status] || inv.status}</span></td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{inv.due_date ? new Date(inv.due_date).toLocaleDateString("ar-EG") : "—"}</td>
                        <td className="px-3 py-2 text-center"><Link href={`/admin/billing/invoices/${inv._id}`} className="text-xs text-[#0A6CF1] hover:underline">عرض</Link></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
