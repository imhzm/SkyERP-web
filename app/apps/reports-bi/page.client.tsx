import { ModulePage } from "@/components/templates/ModulePage";

export default function Page() {
  return (
    <ModulePage
      moduleId="reports-bi"
      hero="كل تقاريرك في لوحة واحدة… وBI لحظي"
      problem="تقارير مبعثرة، قرارات متأخرة، وعدم قدرة على رؤية الصورة الكاملة للشركة."
      sections={["تقارير مالية", "تقارير مبيعات", "تقارير مخزون", "تقارير HR", "لوحات مؤشرات", "تصدير تقارير"]}
      workflow={[
        { step: "اختر التقرير", desc: "اختر من مكتبة التقارير الجاهزة" },
        { step: "تخصيص", desc: "ظبط الفلتر والفترة والتنسيق" },
        { step: "تصدير", desc: "صدّر لـ PDF أو Excel أو مشاركة" },
      ]}
      reports={[
        "لوحات مؤشرات لحظية (KPI)",
        "تقارير مخصصة",
        "تقارير مقارنة دورية",
      ]}
      integrations={[
        "مدمج مع كل الموديولات",
        "تصدير لـ Excel, PDF, Google Sheets",
      ]}
      audience={["المديرين", "أصحاب الشركات", "المحاسبين"]}
      faqs={[]}
    />
  );
}
