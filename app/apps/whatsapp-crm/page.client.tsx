import { ModulePage } from "@/components/templates/ModulePage";

export default function Page() {
  return (
    <ModulePage
      moduleId="whatsapp-crm"
      hero="واتسابك أصبح CRM متكامل… حوّل المحادثات لـ Leads"
      problem="رسائل واتساب مش متابعة، Leads بتتوه في المحادثات."
      sections={["ربط واتساب", "تحويل رسائل لـ Leads", "ردود تلقائية", "متابعة محادثات", "تقارير واتساب"]}
      workflow={[
        { step: "ربط رقم واتساب", desc: "اربط رقم واتساب Business مع النظام" },
        { step: "استقبال الرسائل", desc: "كل رسالة بتتحول لـ Lead أو محادثة" },
        { step: "الرد التلقائي", desc: "ردود تلقائية ذكية للرسائل المتكررة" },
        { step: "المتابعة", desc: "كافولة وفريق المبيعات يتابعوا الـ Leads" },
      ]}
      reports={[
        "تقرير المحادثات",
        "مصادر الـ Leads من واتساب",
        "متوسط وقت الرد",
      ]}
      integrations={[
        "ربط مع WhatsApp Business API",
        "ربط مع CRM",
        "ربط مع المبيعات",
      ]}
      audience={["فرق المبيعات", "خدمة العملاء"]}
      faqs={[]}
    />
  );
}
