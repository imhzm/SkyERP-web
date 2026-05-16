"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/app/admin/layout";
import { ConfirmDialog } from "@/components/admin/Modal";

export default function AdminDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { admin: currentAdmin } = useAdmin();
  const targetId = params.id as string;
  const [target, setTarget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({ full_name: "", role: "", is_active: true, notes: "", new_password: "" });
  const [permForm, setPermForm] = useState({ can_manage_users: false, can_manage_billing: false, can_view_audit: false, can_manage_settings: false });
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => { document.title = "تفاصيل المشرف - Sky ERP"; fetchTarget(); }, [targetId]);

  async function fetchTarget() {
    try {
      const res = await fetch(`/api/admin/admins/${targetId}`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setTarget(data.admin);
      setEditForm({ full_name: data.admin.full_name || "", role: data.admin.role, is_active: data.admin.is_active, notes: data.admin.notes || "", new_password: "" });
      setPermForm({
        can_manage_users: data.admin.permissions?.can_manage_users || false,
        can_manage_billing: data.admin.permissions?.can_manage_billing || false,
        can_view_audit: data.admin.permissions?.can_view_audit || false,
        can_manage_settings: data.admin.permissions?.can_manage_settings || false,
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function saveProfile() {
    setMessage("");
    try {
      const body: any = { full_name: editForm.full_name, role: editForm.role, is_active: editForm.is_active, notes: editForm.notes, permissions: permForm };
      if (editForm.new_password.length >= 8) body.new_password = editForm.new_password;
      const res = await fetch(`/api/admin/admins/${targetId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error || "حدث خطأ"); return; }
      setMessage("تم الحفظ");
      fetchTarget();
    } catch { setMessage("حدث خطأ"); }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/admin/admins/${targetId}`, { method: "DELETE" });
      if (res.ok) router.push("/admin/admins");
    } catch {}
  }

  async function handleLock() {
    try {
      const res = await fetch(`/api/admin/admins/${targetId}/lock`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ duration_minutes: 60 }) });
      const data = await res.json();
      setMessage(data.message || "تم"); fetchTarget();
    } catch { setMessage("حدث خطأ"); }
  }

  async function handleForceLogout() {
    try {
      const res = await fetch(`/api/admin/admins/${targetId}/sessions`, { method: "DELETE" });
      const data = await res.json();
      setMessage(data.message || "تم"); fetchTarget();
    } catch { setMessage("حدث خطأ"); }
  }

  if (loading) return <div className="p-6 text-center text-gray-500">جاري التحميل...</div>;
  if (!target) return <div className="p-6 text-center text-gray-500">المشرف غير موجود</div>;

  const isLocked = target.locked_until && new Date(target.locked_until) > new Date();
  const isFounder = target.role === "founder";

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/admins" className="text-gray-400 text-sm hover:text-white transition">← العودة للمشرفين</Link>

        <div className="flex items-start justify-between mt-2 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{target.full_name || target.email}</h1>
            <p className="text-gray-400 text-sm">{target.email} · {target.role}</p>
          </div>
          {!isFounder && (
            <div className="flex items-center gap-2">
              <button onClick={handleLock} className={`px-3 py-1.5 text-xs rounded-lg border transition cursor-pointer ${isLocked ? "border-green-500/20 text-green-400" : "border-orange-500/20 text-orange-400"}`}>{isLocked ? "فتح" : "قفل"}</button>
              <button onClick={handleForceLogout} className="px-3 py-1.5 text-xs border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition cursor-pointer">إنهاء الجلسات</button>
              <button onClick={() => setConfirmDelete(true)} className="px-3 py-1.5 text-xs border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition cursor-pointer">حذف</button>
            </div>
          )}
        </div>

        {message && (
          <div className={`${message === "حدث خطأ" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"} rounded-lg px-4 py-3 mb-4 text-sm`}>{message}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-sm font-bold text-white mb-4">البيانات الأساسية</h2>
            <div className="space-y-4">
              <div><label className="block text-xs text-gray-400 mb-1">الاسم كامل</label><input type="text" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></div>
              <div><label className="block text-xs text-gray-400 mb-1">الدور</label><select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm"><option value="super_admin">مدير عام</option><option value="admin">مشرف</option><option value="support">دعم فني</option></select></div>
              <div><label className="block text-xs text-gray-400 mb-1">ملاحظات</label><input type="text" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" /></div>
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer"><input type="checkbox" checked={editForm.is_active} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })} className="rounded border-white/20 bg-white/5" />الحساب نشط</label>
              {!isFounder && (
                <div><label className="block text-xs text-gray-400 mb-1">كلمة مرور جديدة (اختياري)</label><input type="password" value={editForm.new_password} onChange={(e) => setEditForm({ ...editForm, new_password: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" minLength={8} placeholder="اترك فارغاً إذا لا تريد التغيير" /></div>
              )}
              <button onClick={saveProfile} className="w-full py-2.5 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer">حفظ التعديلات</button>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-sm font-bold text-white mb-4">الصلاحيات</h2>
            <div className="space-y-3">
              {[
                { key: "can_manage_users", label: "إدارة المستخدمين" },
                { key: "can_manage_billing", label: "إدارة الفواتير" },
                { key: "can_view_audit", label: "عرض النشاطات" },
                { key: "can_manage_settings", label: "إعدادات النظام" },
              ].map((p) => (
                <label key={p.key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer">
                  <span className="text-sm text-gray-300">{p.label}</span>
                  <input type="checkbox" checked={(permForm as any)[p.key]} disabled={isFounder}
                    onChange={(e) => setPermForm({ ...permForm, [p.key]: e.target.checked })}
                    className="rounded border-white/20 bg-white/5" />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white/5 rounded-xl border border-white/10 p-6">
          <h2 className="text-sm font-bold text-white mb-4">معلومات إضافية</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><p className="text-xs text-gray-500 mb-1">آخر دخول</p><p className="text-white text-sm">{target.last_login ? new Date(target.last_login).toLocaleString("ar-EG") : "—"}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">تاريخ الإنشاء</p><p className="text-white text-sm">{new Date(target.created_at).toLocaleDateString("ar-EG")}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">محاولات فاشلة</p><p className="text-white text-sm">{target.login_attempts || 0}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">الحالة</p><p className={target.is_active ? "text-green-400 text-sm" : "text-red-400 text-sm"}>{target.is_active ? "نشط" : "موقوف"}</p></div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="حذف المشرف"
        message={`هل أنت متأكد من حذف ${target.full_name || target.email}؟ لا يمكن التراجع.`}
        variant="danger"
      />
    </div>
  );
}
