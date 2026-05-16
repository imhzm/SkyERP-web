"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const planIcons: Record<string, string> = { trial: "🔬", monthly: "📅", half_yearly: "📆", yearly: "📊", lifetime: "♾️" };

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => { document.title = "الخطط - Sky ERP"; fetchPlans(); }, []);

  async function fetchPlans() {
    try {
      const res = await fetch("/api/admin/billing/plans");
      if (!res.ok) return;
      setPlans((await res.json()).plans || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function togglePlan(key: string, active: boolean) {
    setMessage("");
    try {
      const res = await fetch(`/api/admin/billing/plans/${key}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !active }) });
      if (!res.ok) { const d = await res.json(); setMessage(d.error || "حدث خطأ"); return; }
      setMessage("تم التحديث"); fetchPlans();
    } catch { setMessage("حدث خطأ"); }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/billing" className="text-gray-400 text-sm hover:text-white transition">← العودة</Link>
        <h1 className="text-2xl font-bold text-white mt-2 mb-6">إدارة الخطط</h1>

        {message && <div className={`${message === "حدث خطأ" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"} rounded-lg px-4 py-3 mb-4 text-sm`}>{message}</div>}

        {loading ? <div className="text-center py-12 text-gray-500">جاري التحميل...</div> : plans.length === 0 ? <div className="text-center py-12 text-gray-500">لا توجد خطط</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {plans.map((plan: any) => (
              <div key={plan._id} className={`bg-white/5 rounded-xl border p-5 ${plan.is_active ? "border-white/10" : "border-red-500/20 opacity-60"}`}>
                <div className="flex items-start justify-between mb-4">
                  <div><span className="text-2xl">{planIcons[plan.key] || "📋"}</span><h3 className="text-lg font-bold text-white mt-1">{plan.name}</h3><p className="text-xs text-gray-500">{plan.key}</p></div>
                  <button onClick={() => togglePlan(plan.key, plan.is_active)} className={`text-xs px-2 py-1 rounded cursor-pointer ${plan.is_active ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"}`}>{plan.is_active ? "مفعل" : "معطل"}</button>
                </div>
                <p className="text-3xl font-bold text-white mb-4">{plan.price.toLocaleString()} <span className="text-lg text-gray-400">ج.م</span></p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">المدة</span><span className="text-white">{plan.duration_days} يوم</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">فترة السماح</span><span className="text-white">{plan.grace_period_days} يوم</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">الأجهزة</span><span className="text-white">{plan.max_devices}</span></div>
                </div>
                {plan.features?.length > 0 && (
                  <div className="border-t border-white/10 mt-4 pt-4">
                    <p className="text-xs text-gray-500 mb-2">المميزات:</p>
                    <ul className="space-y-1">{plan.features.map((f: string, idx: number) => <li key={idx} className="text-xs text-gray-400 flex items-center gap-1"><span className="text-green-400">✓</span> {f}</li>)}</ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
