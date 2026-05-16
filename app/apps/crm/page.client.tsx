import { ModulePage } from "@/components/templates/ModulePage";
import { crmFAQs } from "@/data/faqs";

export default function Page() {
  return (
    <ModulePage
      moduleId="crm"
      hero="كل عميل له تاريخ… وكل متابعة في مكانها"
      problem="عملاء كتير، متابعات ضايعة، فرص مبيعات بتضيع — من غير CRM مش هتعرف مين عميلك ولا إيه احتياجه."
      sections={[
        "Leads",
        "Deals",
        "Pipeline",
        "Customer 360",
        "رسائل واتساب",
        "متابعة",
        "أداء فريق المبيعات",
      ]}
      workflow={[
        { step: "تسجيل Lead جديد", desc: "من واتساب أو الموقع أو يدوي" },
        { step: "متابعة في Pipeline", desc: "حرك الصفقة عبر مراحل البيع" },
        { step: "إغلاق الصفقة", desc: "حوّلها لفاتورة بيع مباشرة" },
        { step: "متابعة ما بعد البيع", desc: "خدمة عملاء وتذاكر دعم" },
      ]}
      reports={[
        "خط أنابيب المبيعات",
        "معدل تحويل العملاء",
        "أداء مندوبي المبيعات",
        "تقرير العملاء المتكررين",
        "مصادر الـ Leads",
      ]}
      integrations={[
        "ربط مع واتساب Business API",
        "ربط مع المبيعات والفواتير",
        "ربط مع خدمة العملاء",
        "ربط مع التقارير وBI",
      ]}
      audience={[
        "فرق المبيعات",
        "مديري المبيعات",
        "مسؤولي خدمة العملاء",
        "التسويق",
      ]}
      faqs={crmFAQs}
    />
  );
}
