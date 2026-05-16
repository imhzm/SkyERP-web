"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function AdminInvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: 0, payment_method: "cash" as const, payment_reference: "", notes: "" });
  const [message, setMessage] = useState("");

  useEffect(() => { document.title = "الفاتورة - Sky ERP"; fetchInvoice(); }, [invoiceId]);

  async function fetchInvoice() {
    try {
      const res = await fetch(`/api/admin/billing/invoices/${invoiceId}`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setInvoice(data.invoice);
      setTransactions(data.transactions || []);
      setPaymentForm((p) => ({ ...p, amount: data.invoice?.amount || 0 }));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleMarkPaid(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`/api/admin/billing/invoices/${invoiceId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "mark_paid", ...paymentForm }) });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error || "حدث خطأ"); return; }
      setShowPaymentModal(false); setMessage("تم تسجيل الدفع"); fetchInvoice();
    } catch { setMessage("حدث خطأ"); }
  }

  const sc: Record<string, string> = { paid: "text-green-400 bg-green-500/10", pending: "text-yellow-400 bg-yellow-500/10", overdue: "text-red-400 bg-red-500/10", cancelled: "text-gray-400 bg-gray-500/10", refunded: "text-purple-400 bg-purple-500/10" };

  if (loading) return <div className="p-6 text-center text-gray-500">جاري التحميل...</div>;
  if (!invoice) return <div className="p-6 text-center text-gray-500">الفاتورة غير موجودة</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/billing/invoices" className="text-gray-400 text-sm hover:text-white transition">← العودة</Link>

        <div className="flex items-start justify-between mt-2 mb-6">
          <div><h1 className="text-2xl font-bold text-white">{invoice.invoice_number}</h1><p className="text-gray-400 text-sm">{invoice.username} · {invoice.email}</p></div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 text-sm rounded-lg ${sc[invoice.status] || "bg-gray-500/10 text-gray-400"}`}>{invoice.status}</span>
            {invoice.status !== "paid" && invoice.status !== "cancelled" && (
              <button onClick={() => setShowPaymentModal(true)} className="px-4 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition cursor-pointer">تسجيل دفع</button>
            )}
          </div>
        </div>

        {message && <div className={`${message === "حدث خطأ" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"} rounded-lg px-4 py-3 mb-4 text-sm`}>{message}</div>}

        <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
            {[ {label:"المستخدم", value:<Link href={`/admin/users/${invoice.user_id}`} className="text-sm text-[#0A6CF1] hover:underline">{invoice.username}</Link>}, {label:"الخطة", value:invoice.plan}, {label:"المبلغ", value:<span className="font-bold">{invoice.amount} {invoice.currency}</span>}, {label:"تاريخ الإصدار", value:new Date(invoice.issued_date).toLocaleDateString("ar-EG")}, {label:"تاريخ الاستحقاق", value:new Date(invoice.due_date).toLocaleDateString("ar-EG")}, ...(invoice.paid_date ? [{label:"تاريخ الدفع", value:<span className="text-green-400">{new Date(invoice.paid_date).toLocaleDateString("ar-EG")}</span>}] : []), ...(invoice.payment_method ? [{label:"طريقة الدفع", value:invoice.payment_method}] : []), ...(invoice.payment_reference ? [{label:"مرجع الدفع", value:<span dir="ltr">{invoice.payment_reference}</span>}] : []), ].flat().map((f: any) => (
              <div key={f.label}><p className="text-xs text-gray-500 mb-1">{f.label}</p><p className="text-white text-sm">{f.value}</p></div>
            ))}
          </div>
          {invoice.items?.length > 0 && <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-medium text-white mb-3">البنود</h3>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10">{["الوصف","العدد","سعر الوحدة","الإجمالي"].map(h => <th key={h} className="text-right px-3 py-2 text-gray-400 font-medium">{h}</th>)}</tr></thead>
              <tbody>{invoice.items.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-white/5">
                  <td className="px-3 py-2 text-white">{item.description}</td>
                  <td className="px-3 py-2 text-gray-400">{item.quantity}</td>
                  <td className="px-3 py-2 text-gray-400">{item.unit_price}</td>
                  <td className="px-3 py-2 text-white">{item.total}</td>
                </tr>
              ))}</tbody>
              <tfoot><tr><td colSpan={3} className="px-3 py-2 text-left text-gray-400 font-medium">الإجمالي</td><td className="px-3 py-2 text-white font-bold">{invoice.amount} {invoice.currency}</td></tr></tfoot>
            </table>
          </div>}
          {invoice.notes && <div className="border-t border-white/10 pt-4 mt-4"><p className="text-xs text-gray-500 mb-1">ملاحظات</p><p className="text-white text-sm">{invoice.notes}</p></div>}
        </div>

        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h2 className="text-sm font-bold text-white mb-4">المعاملات المالية</h2>
          {transactions.length === 0 ? <p className="text-gray-500 text-sm text-center py-4">لا توجد معاملات</p> : (
            <div className="space-y-2">{transactions.map((txn: any) => (
              <div key={txn._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div><p className="text-sm text-white">{txn.type === "payment" ? "دفع" : txn.type === "refund" ? "استرجاع" : "تعديل"}</p><p className="text-xs text-gray-500">{txn.payment_method} · {txn.processed_by}</p></div>
                <div className="text-left"><p className={`text-sm font-medium ${txn.type === "payment" ? "text-green-400" : "text-red-400"}`}>{txn.type === "payment" ? "+" : "-"}{txn.amount} {txn.currency}</p><p className="text-xs text-gray-500">{new Date(txn.processed_at).toLocaleDateString("ar-EG")}</p></div>
              </div>
            ))}</div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-white">تسجيل دفع</h2><button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-white cursor-pointer text-xl">✕</button></div>
          <form onSubmit={handleMarkPaid} className="space-y-4">
            <div><label className="block text-xs text-gray-400 mb-1">المبلغ *</label><input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" required min={1} /></div>
            <div><label className="block text-xs text-gray-400 mb-1">طريقة الدفع *</label><select value={paymentForm.payment_method} onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as any })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm"><option value="cash">نقدي</option><option value="bank_transfer">تحويل بنكي</option><option value="credit_card">بطاقة ائتمان</option><option value="wallet">محفظة</option><option value="manual">يدوي</option></select></div>
            <div><label className="block text-xs text-gray-400 mb-1">مرجع الدفع</label><input type="text" value={paymentForm.payment_reference} onChange={(e) => setPaymentForm({ ...paymentForm, payment_reference: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" dir="ltr" /></div>
            <div><label className="block text-xs text-gray-400 mb-1">ملاحظات</label><textarea value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1] resize-none" rows={2} /></div>
            <button type="submit" className="w-full py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition cursor-pointer mt-2">تأكيد الدفع</button>
          </form>
        </div>
      </div>}
    </div>
  );
}
