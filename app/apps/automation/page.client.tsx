import { ModulePage } from "@/components/templates/ModulePage";

export default function Page() {
  return (
    <ModulePage
      moduleId="automation"
      hero="شتغل أتوماتيك… وركز على نمو شركتك"
      problem="مهام متكررة بتضيع وقت، وموافقات بتتأخر، وتنبيهات مهمة بتفوت."
      sections={["قواعد تلقائية", "تنبيهات ذكية", "موافقات تلقائية", "إشعارات فورية", "سير عمل مخصص"]}
      workflow={[
        { step: "حدد القاعدة", desc: "لو حصل X, اعمل Y (زي لو فاتورة زادت عن حد)" },
        { step: "ظبط الإجراء", desc: "حدد الإجراء: إشعار، موافقة، تحديث" },
        { step: "تفعيل", desc: "شغّل القاعدة واشتغل أتوماتيك" },
      ]}
      reports={[
        "سجل الأتمتة",
        "التنبيهات المنفذة",
      ]}
      integrations={[
        "مدمج مع كل موديولات Sky ERP",
      ]}
      audience={["مديري العمليات", "أصحاب الشركات"]}
      faqs={[]}
    />
  );
}
