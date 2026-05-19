"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: 1, title: "معلومات الشركة", desc: "بيانات الشركة الأساسية" },
  { id: 2, title: "البيانات البنكية", desc: "طرق الدفع والتحويل" },
  { id: 3, title: "إعدادات الموارد البشرية", desc: "ساعات العمل والإجازات" },
];

const WEEKDAY_LABELS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

interface FormData {
  company_name: string;
  company_tagline: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_logo_data: string;
  bank_name: string;
  bank_account: string;
  vodafone_cash: string;
  default_tax_rate: number;
  hr_payroll_days_divisor: number;
  hr_standard_work_hours_per_day: number;
  hr_overtime_rate_multiplier: number;
  hr_workday_start_time: string;
  hr_workday_end_time: string;
  hr_late_grace_minutes: number;
  hr_early_leave_grace_minutes: number;
  hr_weekend_days: number[];
  hr_missing_attendance_counts_as_absence: boolean;
}

const defaultForm: FormData = {
  company_name: "",
  company_tagline: "",
  company_address: "",
  company_phone: "",
  company_email: "",
  company_logo_data: "",
  bank_name: "",
  bank_account: "",
  vodafone_cash: "",
  default_tax_rate: 0,
  hr_payroll_days_divisor: 30,
  hr_standard_work_hours_per_day: 8,
  hr_overtime_rate_multiplier: 1.25,
  hr_workday_start_time: "09:00",
  hr_workday_end_time: "17:00",
  hr_late_grace_minutes: 15,
  hr_early_leave_grace_minutes: 15,
  hr_weekend_days: [4, 5],
  hr_missing_attendance_counts_as_absence: true,
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black"><div className="w-12 h-12 border-4 border-[#0A6CF1] border-t-transparent rounded-full animate-spin" /></div>}>
      <OnboardingWizard />
    </Suspense>
  );
}

function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function loadExisting() {
      try {
        const userRes = await fetch("/api/user/me");
        if (!userRes.ok) {
          router.replace("/login");
          return;
        }
        const res = await fetch("/api/organization/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            if (data.settings.company_name) {
              router.replace("/dashboard");
              return;
            }
            setForm((prev) => ({
              ...prev,
              company_name: data.settings.company_name || prev.company_name,
              company_tagline: data.settings.company_tagline || prev.company_tagline,
              company_address: data.settings.company_address || prev.company_address,
              company_phone: data.settings.company_phone || prev.company_phone,
              company_email: data.settings.company_email || prev.company_email,
              company_logo_data: data.settings.company_logo_data || prev.company_logo_data,
              bank_name: data.settings.bank_name || prev.bank_name,
              bank_account: data.settings.bank_account || prev.bank_account,
              vodafone_cash: data.settings.vodafone_cash || prev.vodafone_cash,
              default_tax_rate: data.settings.default_tax_rate ?? prev.default_tax_rate,
              hr_payroll_days_divisor: data.settings.hr_payroll_days_divisor ?? prev.hr_payroll_days_divisor,
              hr_standard_work_hours_per_day: data.settings.hr_standard_work_hours_per_day ?? prev.hr_standard_work_hours_per_day,
              hr_overtime_rate_multiplier: data.settings.hr_overtime_rate_multiplier ?? prev.hr_overtime_rate_multiplier,
              hr_workday_start_time: data.settings.hr_workday_start_time || prev.hr_workday_start_time,
              hr_workday_end_time: data.settings.hr_workday_end_time || prev.hr_workday_end_time,
              hr_late_grace_minutes: data.settings.hr_late_grace_minutes ?? prev.hr_late_grace_minutes,
              hr_early_leave_grace_minutes: data.settings.hr_early_leave_grace_minutes ?? prev.hr_early_leave_grace_minutes,
              hr_weekend_days: data.settings.hr_weekend_days ?? prev.hr_weekend_days,
              hr_missing_attendance_counts_as_absence: data.settings.hr_missing_attendance_counts_as_absence ?? prev.hr_missing_attendance_counts_as_absence,
            }));
            if (data.settings.company_logo_data) {
              setLogoPreview(data.settings.company_logo_data);
            }
          }
        }
      } catch {}
      setInitialLoading(false);
    }
    loadExisting();
  }, []);

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      setError("حجم الشعار يجب أن يكون أقل من 1.5 ميجابايت");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      updateField("company_logo_data", result);
      setLogoPreview(result);
    };
    reader.readAsDataURL(file);
  }

  function toggleWeekend(day: number) {
    setForm((prev) => {
      const days = prev.hr_weekend_days.includes(day)
        ? prev.hr_weekend_days.filter((d) => d !== day)
        : [...prev.hr_weekend_days, day];
      return { ...prev, hr_weekend_days: days.sort() };
    });
  }

  function validateStep(): boolean {
    setError("");
    if (step === 1) {
      if (!form.company_name.trim()) {
        setError("اسم الشركة مطلوب");
        return false;
      }
      if (form.company_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.company_email)) {
        setError("البريد الإلكتروني غير صالح");
        return false;
      }
    }
    return true;
  }

  function nextStep() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, 3));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    if (!validateStep()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/organization/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        return;
      }

      router.replace("/dashboard");
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-[#0A6CF1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">إعداد المنظمة</h1>
            <p className="text-gray-400 text-sm">أكمل بيانات شركتك لبدء استخدام النظام</p>
          </div>

          <div className="flex items-center justify-between mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition ${step > s.id ? "bg-green-500 text-white" : step === s.id ? "bg-[#0A6CF1] text-white" : "bg-white/10 text-gray-500"}`}>
                    {step > s.id ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : s.id}
                  </div>
                  <span className={`text-xs mt-1.5 ${step >= s.id ? "text-white" : "text-gray-500"}`}>{s.title}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-2 mt-[-16px] ${step > s.id ? "bg-green-500" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>

          <p className="text-gray-400 text-xs mb-6">{STEPS[step - 1].desc}</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">{error}</div>
          )}

          <div className="space-y-5">
            {step === 1 && <StepCompany form={form} updateField={updateField} logoPreview={logoPreview} handleLogoUpload={handleLogoUpload} />}
            {step === 2 && <StepBanking form={form} updateField={updateField} />}
            {step === 3 && <StepHR form={form} updateField={updateField} toggleWeekend={toggleWeekend} />}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="px-6 py-2.5 text-gray-400 hover:text-white transition cursor-pointer text-sm">السابق</button>
            ) : (
              <button type="button" onClick={() => router.push("/dashboard")} className="px-6 py-2.5 text-gray-500 hover:text-gray-300 transition cursor-pointer text-sm">تخطي</button>
            )}
            {step < 3 ? (
              <button type="button" onClick={nextStep} className="px-8 py-2.5 bg-[#0A6CF1] hover:bg-[#0955c4] text-white rounded-lg font-medium transition cursor-pointer text-sm">التالي</button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading} className="px-8 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition cursor-pointer text-sm">
                {loading ? "جاري الحفظ..." : "إنهاء الإعداد"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCompany({ form, updateField, logoPreview, handleLogoUpload }: {
  form: FormData;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  logoPreview: string | null;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-4 mb-2">
        <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
          {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" /> : <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-2">شعار الشركة</label>
          <label className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-sm hover:text-white hover:bg-white/10 transition cursor-pointer">
            اختر صورة
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">اسم الشركة <span className="text-red-400">*</span></label>
        <input type="text" value={form.company_name} onChange={(e) => updateField("company_name", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] focus:ring-1 focus:ring-[#0A6CF1] transition" placeholder="اسم الشركة أو المؤسسة" required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">الشعار النصي</label>
        <input type="text" value={form.company_tagline} onChange={(e) => updateField("company_tagline", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] focus:ring-1 focus:ring-[#0A6CF1] transition" placeholder="شعار قصير للشركة" maxLength={200} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">العنوان</label>
        <input type="text" value={form.company_address} onChange={(e) => updateField("company_address", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] focus:ring-1 focus:ring-[#0A6CF1] transition" placeholder="عنوان الشركة بالتفصيل" maxLength={300} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">هاتف الشركة</label>
          <input type="tel" value={form.company_phone} onChange={(e) => updateField("company_phone", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] focus:ring-1 focus:ring-[#0A6CF1] transition" placeholder="+201234567890" dir="ltr" maxLength={30} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">بريد الشركة</label>
          <input type="email" value={form.company_email} onChange={(e) => updateField("company_email", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] focus:ring-1 focus:ring-[#0A6CF1] transition" placeholder="info@company.com" dir="ltr" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">نسبة الضريبة الافتراضية (%)</label>
        <input type="number" value={form.default_tax_rate} onChange={(e) => updateField("default_tax_rate", Number(e.target.value))} min={0} max={100} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] focus:ring-1 focus:ring-[#0A6CF1] transition" dir="ltr" />
      </div>
    </>
  );
}

function StepBanking({ form, updateField }: { form: FormData; updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">اسم البنك</label>
        <input type="text" value={form.bank_name} onChange={(e) => updateField("bank_name", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] focus:ring-1 focus:ring-[#0A6CF1] transition" placeholder="البنك الأهلي المصري" maxLength={100} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">رقم الحساب البنكي</label>
        <input type="text" value={form.bank_account} onChange={(e) => updateField("bank_account", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] focus:ring-1 focus:ring-[#0A6CF1] transition" placeholder="رقم الحساب أو IBAN" dir="ltr" maxLength={50} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">رقم فودافون كاش</label>
        <input type="tel" value={form.vodafone_cash} onChange={(e) => updateField("vodafone_cash", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A6CF1] focus:ring-1 focus:ring-[#0A6CF1] transition" placeholder="+201234567890" dir="ltr" maxLength={30} />
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-blue-400 text-sm">
        يمكنك تعديل هذه البيانات لاحقاً من إعدادات المنظمة
      </div>
    </>
  );
}

function StepHR({ form, updateField, toggleWeekend }: {
  form: FormData;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  toggleWeekend: (day: number) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">بداية الدوام</label>
          <input type="time" value={form.hr_workday_start_time} onChange={(e) => updateField("hr_workday_start_time", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0A6CF1] focus:ring-1 focus:ring-[#0A6CF1] transition" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">نهاية الدوام</label>
          <input type="time" value={form.hr_workday_end_time} onChange={(e) => updateField("hr_workday_end_time", e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0A6CF1] focus:ring-1 focus:ring-[#0A6CF1] transition" dir="ltr" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">ساعات العمل/يوم</label>
          <input type="number" value={form.hr_standard_work_hours_per_day} onChange={(e) => updateField("hr_standard_work_hours_per_day", Number(e.target.value))} min={1} max={24} step={0.5} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0A6CF1] focus:ring-1 focus:ring-[#0A6CF1] transition" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">مضاعف الأوفر تايم</label>
          <input type="number" value={form.hr_overtime_rate_multiplier} onChange={(e) => updateField("hr_overtime_rate_multiplier", Number(e.target.value))} min={1} max={5} step={0.25} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0A6CF1] focus:ring-1 focus:ring-[#0A6CF1] transition" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">مقسوم الراتب</label>
          <input type="number" value={form.hr_payroll_days_divisor} onChange={(e) => updateField("hr_payroll_days_divisor", Number(e.target.value))} min={1} max={31} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0A6CF1] focus:ring-1 focus:ring-[#0A6CF1] transition" dir="ltr" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">سماح تأخير (دقيقة)</label>
          <input type="number" value={form.hr_late_grace_minutes} onChange={(e) => updateField("hr_late_grace_minutes", Number(e.target.value))} min={0} max={120} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0A6CF1] focus:ring-1 focus:ring-[#0A6CF1] transition" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">سماح انصراف مبكر (دقيقة)</label>
          <input type="number" value={form.hr_early_leave_grace_minutes} onChange={(e) => updateField("hr_early_leave_grace_minutes", Number(e.target.value))} min={0} max={120} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0A6CF1] focus:ring-1 focus:ring-[#0A6CF1] transition" dir="ltr" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">أيام العطلة الأسبوعية</label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAY_LABELS.map((label, i) => (
            <button key={i} type="button" onClick={() => toggleWeekend(i)} className={`px-3 py-1.5 rounded-lg text-sm transition cursor-pointer ${form.hr_weekend_days.includes(i) ? "bg-[#0A6CF1] text-white" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="missing_absence" checked={form.hr_missing_attendance_counts_as_absence} onChange={(e) => updateField("hr_missing_attendance_counts_as_absence", e.target.checked)} className="w-4 h-4 rounded bg-white/5 border-white/20 text-[#0A6CF1] cursor-pointer" />
        <label htmlFor="missing_absence" className="text-sm text-gray-300 cursor-pointer">عدم تسجيل الحضور يُحسب كغياب</label>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-blue-400 text-sm">
        جميع هذه الإعدادات اختيارية ويمكن تعديلها لاحقاً من إعدادات الموارد البشرية
      </div>
    </>
  );
}
