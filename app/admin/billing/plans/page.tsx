"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";

const planIcons: Record<string, string> = { trial: "🔬", monthly: "", half_yearly: "📆", yearly: "📊", lifetime: "️" };

const ALL_APPS = [
  { id: "dashboard", name: "الصفحة الرئيسية" },
  { id: "tasks", name: "المهام" },
  { id: "clients", name: "العملاء" },
  { id: "services", name: "الخدمات" },
  { id: "expenses", name: "المصروفات" },
  { id: "projects", name: "المشاريع" },
  { id: "accounting", name: "المحاسبة" },
  { id: "hr", name: "الموارد البشرية" },
  { id: "payments", name: "المدفوعات" },
  { id: "invoicing", name: "الفواتير" },
  { id: "notifications", name: "الإشعارات" },
  { id: "templates", name: "القوالب" },
  { id: "printing", name: "الطباعة" },
  { id: "export", name: "التصدير" },
  { id: "settings", name: "الإعدادات" },
  { id: "manufacturing", name: "التصنيع" },
  { id: "pos", name: "نقاط البيع" },
  { id: "crm", name: "إدارة العلاقات" },
];

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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

  async function deletePlan(key: string) {
    if (!confirm(`هل أنت متأكد من حذف خطة ${key}؟`)) return;
    try {
      const res = await fetch(`/api/admin/billing/plans/${key}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); setMessage(d.error || "حدث خطأ"); return; }
      setMessage("تم الحذف"); fetchPlans();
    } catch { setMessage("حدث خطأ"); }
  }

  async function savePlan(plan: any) {
    try {
      const method = plan._id ? "PATCH" : "POST";
      const url = plan._id ? `/api/admin/billing/plans/${plan.key}` : "/api/admin/billing/plans";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(plan) });
      if (!res.ok) { const d = await res.json(); setMessage(d.error || "حدث خطأ"); return; }
      setMessage("تم الحفظ بنجاح"); setEditingPlan(null); setIsCreating(false); fetchPlans();
    } catch { setMessage("حدث خطأ"); }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/billing" className="text-gray-400 text-sm hover:text-white transition">← العودة</Link>
          <button onClick={() => { setIsCreating(true); setEditingPlan({ key: "", name: "", price: 0, duration_days: 30, allowed_apps: "*", features: [], max_devices: 1, grace_period_days: 7, is_active: true }); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" /> إضافة خطة
          </button>
        </div>

        <h1 className="text-2xl font-bold text-white mb-6">إدارة الخطط والصلاحيات</h1>

        {message && <div className={`${message.includes("خطأ") ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"} rounded-lg px-4 py-3 mb-4 text-sm`}>{message}</div>}

        {loading ? <div className="text-center py-12 text-gray-500">جاري التحميل...</div> : plans.length === 0 ? <div className="text-center py-12 text-gray-500">لا توجد خطط</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {plans.map((plan: any) => (
              <div key={plan._id} className={`bg-white/5 rounded-xl border p-6 relative group ${plan.is_active ? "border-white/10" : "border-red-500/20 opacity-60"}`}>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingPlan(plan)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-gray-400 hover:text-white"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deletePlan(plan.key)} className="p-1.5 bg-white/10 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <span className="text-3xl">{planIcons[plan.key] || "📋"}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">{plan.key}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-white">{plan.price.toLocaleString()}</span>
                  <span className="text-sm text-gray-400">ج.م / {plan.duration_days} يوم</span>
                </div>

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between"><span className="text-gray-400">الأجهزة</span><span className="text-white font-medium">{plan.max_devices}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">فترة السماح</span><span className="text-white font-medium">{plan.grace_period_days} يوم</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">الحالة</span>
                    <button onClick={() => togglePlan(plan.key, plan.is_active)} className={`px-2 py-0.5 rounded text-xs font-medium ${plan.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {plan.is_active ? "مفعل" : "معطل"}
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-gray-500 mb-2">التطبيقات المتاحة:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.allowed_apps === "*" ? (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-md font-medium">كل التطبيقات (18)</span>
                    ) : (
                      plan.allowed_apps?.map((app: string) => (
                        <span key={app} className="px-2 py-1 bg-white/5 text-gray-300 text-xs rounded-md border border-white/10">
                          {ALL_APPS.find(a => a.id === app)?.name || app}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Editor Modal */}
        {(editingPlan || isCreating) && (
          <PlanEditor
            plan={editingPlan}
            isNew={isCreating}
            onSave={savePlan}
            onClose={() => { setEditingPlan(null); setIsCreating(false); }}
          />
        )}
      </div>
    </div>
  );
}

function PlanEditor({ plan, isNew, onSave, onClose }: { plan: any; isNew: boolean; onSave: (p: any) => void; onClose: () => void }) {
  const [form, setForm] = useState(plan);
  const [allAppsSelected, setAllAppsSelected] = useState(plan.allowed_apps === "*");

  const toggleApp = (appId: string) => {
    if (allAppsSelected) {
      setAllAppsSelected(false);
      setForm({ ...form, allowed_apps: ALL_APPS.filter(a => a.id !== appId).map(a => a.id) });
    } else {
      const current = form.allowed_apps || [];
      const updated = current.includes(appId) ? current.filter((id: string) => id !== appId) : [...current, appId];
      setForm({ ...form, allowed_apps: updated });
    }
  };

  const toggleAll = () => {
    setAllAppsSelected(!allAppsSelected);
    setForm({ ...form, allowed_apps: !allAppsSelected ? "*" : [] });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/10 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-white">{isNew ? "إضافة خطة جديدة" : `تعديل خطة: ${form.name}`}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">اسم الخطة</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" placeholder="مثال: شهري" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">المعرف (Key)</label>
              <input type="text" value={form.key} onChange={e => setForm({ ...form, key: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:border-blue-500 focus:outline-none" placeholder="monthly" disabled={!isNew} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">السعر (ج.م)</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">المدة (يوم)</label>
              <input type="number" value={form.duration_days} onChange={e => setForm({ ...form, duration_days: Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">الأجهزة</label>
              <input type="number" value={form.max_devices} onChange={e => setForm({ ...form, max_devices: Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          {/* Apps Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-gray-400">التطبيقات المتاحة</label>
              <button onClick={toggleAll} className={`text-xs px-3 py-1 rounded-full font-medium transition ${allAppsSelected ? "bg-blue-500 text-white" : "bg-white/10 text-gray-400 hover:text-white"}`}>
                {allAppsSelected ? "✓ كل التطبيقات" : "تحديد الكل"}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-white/5 rounded-lg border border-white/10">
              {ALL_APPS.map(app => {
                const isSelected = allAppsSelected || (form.allowed_apps || []).includes(app.id);
                return (
                  <button key={app.id} onClick={() => !allAppsSelected && toggleApp(app.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition ${isSelected ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-white/5 text-gray-400 border border-transparent hover:bg-white/10"}`}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? "bg-blue-500 border-blue-500" : "border-gray-600"}`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    {app.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">المميزات (كل ميزة في سطر)</label>
            <textarea value={(form.features || []).join("\n")} onChange={e => setForm({ ...form, features: e.target.value.split("\n").filter(Boolean) })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none resize-none" placeholder="دعم فني&#10;تحديثات مجانية" />
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-white/10 p-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">إلغاء</button>
          <button onClick={() => onSave(form)} className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">حفظ التغييرات</button>
        </div>
      </div>
    </div>
  );
}
