"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "../layout";

export default function AdminSettingsPage() {
  const { admin, refresh } = useAdmin();
  const [pw, setPw] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { document.title = "الإعدادات - Sky ERP"; if (admin) setName(admin.full_name); }, [admin]);

  function showMsg(text: string, type: "success" | "error") { setMessage(text); setMsgType(type); setTimeout(() => setMessage(""), 5000); }

  async function handleNameSave() {
    if (!name.trim()) { showMsg("الاسم لا يمكن أن يكون فارغًا", "error"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ full_name: name.trim() }) });
      const data = await res.json();
      if (!res.ok) { showMsg(data.error || "حدث خطأ", "error"); return; }
      showMsg("تم تحديث الاسم", "success");
      refresh();
    } catch { showMsg("حدث خطأ في الاتصال", "error"); }
    finally { setSubmitting(false); }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (pw.new_password !== pw.confirm_password) { showMsg("كلمة المرور غير متطابقة", "error"); return; }
    if (pw.new_password.length < 8) { showMsg("كلمة المرور يجب أن تكون 8 أحرف على الأقل", "error"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current_password: pw.current_password, new_password: pw.new_password }) });
      const data = await res.json();
      if (!res.ok) { showMsg(data.error || "حدث خطأ", "error"); return; }
      showMsg("تم تغيير كلمة المرور بنجاح", "success");
      setPw({ current_password: "", new_password: "", confirm_password: "" });
    } catch { showMsg("حدث خطأ في الاتصال", "error"); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">الإعدادات</h1>

        {message && (
          <div className={`${msgType === "error" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-green-500/10 text-green-400 border-green-500/20"} rounded-lg px-4 py-3 mb-4 text-sm border transition-opacity`}>
            {message}
          </div>
        )}

        {/* Profile */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-6">
          <h2 className="text-sm font-bold text-white mb-4">معلومات الحساب</h2>
          {admin ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><p className="text-xs text-gray-500 mb-1">البريد الإلكتروني</p><p className="text-white text-sm">{admin.email}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">الدور</p><span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300">{admin.role}</span></div>
              </div>
              <div className="border-t border-white/10 pt-4">
                <label className="block text-xs text-gray-400 mb-1">الاسم كامل</label>
                <div className="flex gap-2">
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" />
                  <button onClick={handleNameSave} disabled={submitting || name === admin.full_name}
                    className="px-4 py-2 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer disabled:opacity-50">حفظ</button>
                </div>
              </div>
            </>
          ) : <p className="text-gray-500 text-sm">جاري التحميل...</p>}
        </div>

        {/* Password */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-6">
          <h2 className="text-sm font-bold text-white mb-4">تغيير كلمة المرور</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div><label className="block text-xs text-gray-400 mb-1">كلمة المرور الحالية</label><input type="password" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" required /></div>
            <div><label className="block text-xs text-gray-400 mb-1">كلمة المرور الجديدة</label><input type="password" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" required minLength={8} /></div>
            <div><label className="block text-xs text-gray-400 mb-1">تأكيد كلمة المرور</label><input type="password" value={pw.confirm_password} onChange={(e) => setPw({ ...pw, confirm_password: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0A6CF1]" required minLength={8} /></div>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-[#0A6CF1] text-white rounded-lg text-sm font-medium hover:bg-[#0955c4] transition cursor-pointer disabled:opacity-50">{submitting ? "جاري..." : "تغيير كلمة المرور"}</button>
          </form>
        </div>

        {/* System Info */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h2 className="text-sm font-bold text-white mb-4">معلومات النظام</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div><p className="text-xs text-gray-500 mb-1">الإصدار</p><p className="text-white">1.0.0</p></div>
            <div><p className="text-xs text-gray-500 mb-1">بيئة التشغيل</p><p className="text-white">{typeof window !== "undefined" ? window.location.hostname : "—"}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">آخر تحديث</p><p className="text-white">2026-05-16</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
