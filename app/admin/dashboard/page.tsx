"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "../layout";
import Link from "next/link";
import { CardSkeleton } from "@/components/admin/LoadingSkeleton";

interface Stats {
  users: { total: number; active: number; suspended: number; trial: number; expired: number; device_bound: number; locked: number; plans: { _id: string; count: number }[] };
  admins: { total: number; founders: number };
  revenue: { total: number; invoices: { total: number; paid: number; overdue: number } };
  recent: { registrations: any[]; logins: any[] };
}

function StatCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: string }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{icon}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${color} bg-opacity-20`}>{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-8 text-left">{pct}%</span>
    </div>
  );
}

const planColors: Record<string, string> = { trial: "bg-blue-500", monthly: "bg-green-500", half_yearly: "bg-purple-500", yearly: "bg-orange-500", lifetime: "bg-pink-500" };
const planLabels: Record<string, string> = { trial: "تجريبي", monthly: "شهري", half_yearly: "نصف سنوي", yearly: "سنوي", lifetime: "دائم" };

export default function AdminDashboardPage() {
  const { admin } = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "لوحة التحكم - Sky ERP"; fetchStats(); }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const isFounder = admin?.role === "founder";

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">لوحة التحكم</h1>
          {admin?.role && (
            <p className="text-xs text-gray-500 mt-1">
              مرحباً {admin?.full_name || admin?.email} · <span className="text-[#0A6CF1]">{isFounder ? "المؤسس" : "مشرف"}</span>
            </p>
          )}
        </div>
        <button onClick={fetchStats} className="text-xs text-gray-400 hover:text-white px-3 py-1.5 bg-white/5 rounded-lg transition cursor-pointer">تحديث</button>
      </div>

      {!stats && loading ? <CardSkeleton count={8} /> : !stats ? (
        <div className="text-center py-12">
          <p className="text-gray-500">لا توجد بيانات</p>
          <button onClick={fetchStats} className="mt-4 px-4 py-2 bg-[#0A6CF1] text-white rounded-lg text-sm cursor-pointer">إعادة المحاولة</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
            <StatCard label="إجمالي" value={stats.users.total} color="bg-blue-500" icon="👥" />
            <StatCard label="نشط" value={stats.users.active} color="bg-green-500" icon="✅" />
            <StatCard label="معلق" value={stats.users.suspended} color="bg-red-500" icon="🔒" />
            <StatCard label="تجريبي" value={stats.users.trial} color="bg-purple-500" icon="🔬" />
            <StatCard label="منتهي" value={stats.users.expired} color="bg-yellow-500" icon="⏰" />
            <StatCard label="مقيد الجهاز" value={stats.users.device_bound} color="bg-cyan-500" icon="💻" />
            <StatCard label="مقفول" value={stats.users.locked} color="bg-orange-500" icon="🔐" />
            <StatCard label="الإيرادات" value={`${stats.revenue.total.toLocaleString()} ج.م`} color="bg-emerald-500" icon="💰" />
            {isFounder && <StatCard label="المشرفين" value={stats.admins?.total || 0} color="bg-amber-500" icon="🛡️" />}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
              <h2 className="text-sm font-bold text-white mb-4">توزيع الخطط</h2>
              <div className="space-y-3">
                {stats.users.plans.length === 0 ? <p className="text-gray-500 text-sm">لا توجد بيانات</p> : stats.users.plans.map((p) => (
                  <div key={p._id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">{planLabels[p._id] || p._id}</span>
                      <span className="text-xs text-gray-500">{p.count}</span>
                    </div>
                    <Bar value={p.count} max={stats.users.total} color={planColors[p._id] || "bg-gray-500"} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
              <h2 className="text-sm font-bold text-white mb-4">ملخص الفواتير</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">مدفوعة</span>
                    <span className="text-xs text-green-400">{stats.revenue.invoices.paid}</span>
                  </div>
                  <Bar value={stats.revenue.invoices.paid} max={stats.revenue.invoices.total || 1} color="bg-green-500" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">متأخرة</span>
                    <span className="text-xs text-red-400">{stats.revenue.invoices.overdue}</span>
                  </div>
                  <Bar value={stats.revenue.invoices.overdue} max={stats.revenue.invoices.total || 1} color="bg-red-500" />
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-gray-400">إجمالي الفواتير</span>
                  <span className="text-xs text-white">{stats.revenue.invoices.total}</span>
                </div>
                <Link href="/admin/billing" className="block text-center text-sm text-[#0A6CF1] hover:underline pt-2">إدارة الفواتير ←</Link>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
              <h2 className="text-sm font-bold text-white mb-4">إجراءات سريعة</h2>
              <div className="space-y-2">
                <Link href="/admin/users" className="block px-4 py-2.5 bg-[#0A6CF1]/10 text-[#0A6CF1] rounded-lg text-sm font-medium text-center hover:bg-[#0A6CF1]/20 transition">+ إضافة مستخدم جديد</Link>
                <Link href="/admin/billing/invoices" className="block px-4 py-2.5 bg-white/5 text-gray-300 rounded-lg text-sm text-center hover:bg-white/10 transition">إنشاء فاتورة جديدة</Link>
                <Link href="/admin/activity" className="block px-4 py-2.5 bg-white/5 text-gray-300 rounded-lg text-sm text-center hover:bg-white/10 transition">عرض سجل النشاطات</Link>
                {isFounder && (
                  <Link href="/admin/admins" className="block px-4 py-2.5 bg-orange-500/10 text-orange-400 rounded-lg text-sm text-center hover:bg-orange-500/20 transition">إدارة المشرفين</Link>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
              <h2 className="text-sm font-bold text-white mb-4">آخر التسجيلات</h2>
              {stats.recent.registrations.length === 0 ? <p className="text-gray-500 text-sm text-center py-4">لا يوجد</p> : (
                <div className="space-y-1">
                  {stats.recent.registrations.map((u: any) => (
                    <Link key={u._id} href={`/admin/users/${u._id}`} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition">
                      <div>
                        <p className="text-sm text-white">{u.full_name || u.username}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString("ar-EG")}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
              <h2 className="text-sm font-bold text-white mb-4">آخر الدخول</h2>
              {stats.recent.logins.length === 0 ? <p className="text-gray-500 text-sm text-center py-4">لا يوجد</p> : (
                <div className="space-y-1">
                  {stats.recent.logins.map((u: any) => (
                    <Link key={u._id} href={`/admin/users/${u._id}`} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition">
                      <div>
                        <p className="text-sm text-white">{u.full_name || u.username}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                      <span className="text-xs text-gray-500">{u.last_login ? new Date(u.last_login).toLocaleDateString("ar-EG") : "—"}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
