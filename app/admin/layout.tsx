"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface AdminUser {
  id: string; email: string; full_name: string; role: string;
  permissions?: {
    can_manage_users: boolean;
    can_manage_billing: boolean;
    can_view_audit: boolean;
    can_manage_admins: boolean;
    can_manage_settings: boolean;
  };
}

interface AdminContextType {
  admin: AdminUser | null;
  refresh: () => Promise<void>;
}

const AdminCtx = createContext<AdminContextType>({ admin: null, refresh: async () => {} });
export const useAdmin = () => useContext(AdminCtx);

const allNavItems = [
  { href: "/admin/dashboard", label: "لوحة التحكم", icon: "📊", permission: null as string | null },
  { href: "/admin/users", label: "المستخدمين", icon: "👥", permission: "can_manage_users" },
  { href: "/admin/admins", label: "المشرفين", icon: "🔐", permission: "can_manage_admins" },
  { href: "/admin/billing", label: "الفواتير", icon: "💰", permission: "can_manage_billing" },
  { href: "/admin/billing/plans", label: "الخطط", icon: "📋", permission: "can_manage_billing" },
  { href: "/admin/reports", label: "التقارير", icon: "📈", permission: null },
  { href: "/admin/activity", label: "النشاطات", icon: "📜", permission: "can_view_audit" },
  { href: "/admin/settings", label: "الإعدادات", icon: "⚙️", permission: "can_manage_settings" },
];

function getNavItems(role: string, permissions?: AdminUser["permissions"]) {
  const isFounder = role === "founder";
  return allNavItems.filter((item) => {
    if (!item.permission) return true;
    if (isFounder) return true;
    return permissions?.[item.permission as keyof NonNullable<AdminUser["permissions"]>] === true;
  });
}

function isActive(href: string, pathname: string): boolean {
  if (href === "/admin/dashboard") return pathname === href || pathname === "/admin";
  return pathname.startsWith(href);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Login page has its own layout - skip auth check
  const isLoginPage = pathname === "/admin/login";

  async function refresh() {
    try {
      const res = await fetch("/api/admin/me");
      if (!res.ok) { router.push("/admin/login"); return; }
      const data = await res.json();
      setAdmin(data.admin);
    } catch { router.push("/admin/login"); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (!isLoginPage) refresh(); else setLoading(false);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center" dir="rtl">
        <div className="text-gray-400">جاري التحميل...</div>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <AdminCtx.Provider value={{ admin, refresh }}>
      <div className="min-h-screen bg-[#0a0a0a]" dir="rtl">
        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 right-0 left-0 z-30 bg-[#0a0a0a] border-b border-white/10 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white cursor-pointer text-lg">☰</button>
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0A6CF1] to-[#8B2CF5] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-white font-medium text-sm">Sky ERP</span>
          </Link>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 cursor-pointer text-sm">خروج</button>
        </div>

        {/* Sidebar */}
        <aside className={`fixed right-0 top-0 h-full w-64 bg-[#0a0a0a] border-l border-white/10 z-50 transition-transform duration-200 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        } lg:translate-x-0`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0A6CF1] to-[#8B2CF5] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Sky ERP</p>
                  <p className="text-gray-500 text-xs">لوحة التحكم</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="border-t border-white/10 pt-4 mb-4">
              <p className="text-xs text-gray-500 truncate">{admin.email}</p>
              <p className="text-xs text-[#0A6CF1]">{admin.full_name}</p>
            </div>

            <nav className="space-y-1">
              {getNavItems(admin.role, admin.permissions).map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                    isActive(item.href, pathname)
                      ? "bg-[#0A6CF1]/10 text-[#0A6CF1]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}>
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-white/10">
            <Link href="/dashboard" className="block w-full px-4 py-2 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg text-sm transition text-center mb-2">
              ← العودة للموقع
            </Link>
            <button onClick={handleLogout} className="w-full px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition cursor-pointer">
              تسجيل الخروج
            </button>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main content */}
        <main className="lg:mr-64 pt-14 lg:pt-0 min-h-screen">
          {children}
        </main>
      </div>
    </AdminCtx.Provider>
  );
}
