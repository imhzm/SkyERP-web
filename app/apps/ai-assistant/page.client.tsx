import { ModulePage } from "@/components/templates/ModulePage";

export default function Page() {
  return (
    <ModulePage
      moduleId="ai-assistant"
      hero="اسأل نظامك… وخد قرارك أسرع"
      problem="البيانات موجودة بس صعب توصل لها بسرعة. عايز تعرف إيه أفضل فرع مبيعات حالًا؟"
      sections={["استفسارات ذكية", "تحليلات فورية", "توصيات ذكية", "تقارير ذكية"]}
      workflow={[
        { step: "اسأل", desc: "اكتب سؤالك بالعربية الفصحى أو العامية" },
        { step: "تحليل", desc: "AI Assistant يحلل البيانات ويجيب الإجابة" },
        { step: "إجابة", desc: "الإجابة بتظهر مع رسم بياني لو لزم" },
      ]}
      reports={[
        "تقارير ذكية مخصصة",
        "تحليلات تنبؤية",
      ]}
      integrations={[
        "مدمج مع كل موديولات Sky ERP",
      ]}
      audience={["المديرين التنفيذيين", "أصحاب الشركات", "كل مستخدمي النظام"]}
      faqs={[]}
    />
  );
}
