import { ModulePage } from "@/components/templates/ModulePage";

export default function Page() {
  return (
    <ModulePage
      moduleId="marketplace"
      hero="اختار التطبيقات اللي تحتاجها… وشغّل نظامك"
      problem="مش محتاج كل الحاجة. عايز بس الموديولات اللي تخدم شركتك."
      sections={["تطبيقات جاهزة", "تثبيت بنقرة واحدة", "إدارة التطبيقات", "توافق كامل", "تحديثات مستمرة"]}
      workflow={[
        { step: "تصفح المتجر", desc: "شوف كل التطبيقات المتاحة" },
        { step: "ثبّت", desc: "بنقرة واحدة التطبيق بيشتغل" },
        { step: "فعل أو أوقف", desc: "تحكم كامل في التطبيقات" },
      ]}
      reports={[]}
      integrations={[]}
      audience={["أصحاب الشركات", "المديرين التنفيذيين"]}
      faqs={[]}
    />
  );
}
