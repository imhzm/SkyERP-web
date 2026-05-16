import { createMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { getBreadcrumbs } from "@/lib/seo/breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { FeatureCard } from "@/components/cards";
import { ClipboardList, GraduationCap, Rocket, HeadphonesIcon, Settings, BarChart3 } from "lucide-react";

export const metadata = createMetadata({
  title: "تنفيذ وتشغيل Sky ERP",
  description: "خطوات تطبيق Sky ERP داخل شركتك من الإعداد والتدريب إلى الإطلاق والمتابعة.",
  path: "/implementation",
  ogImage: "/images/og/implementation-og.webp",
});

export default function ImplementationPage() {
  const breadcrumbs = getBreadcrumbs("/implementation");
  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <div className="pt-28 pb-20">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <SectionHeading
            title="كيف نطبق Sky ERP في شركتك؟"
            subtitle="خطوات واضحة من البداية للإطلاق - احنا معاك في كل خطوة"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FeatureCard
              icon={<ClipboardList className="w-6 h-6 text-[#0A6CF1]" />}
              title="1. التخطيط والتقييم"
              description="نفهم احتياجات شركتك، نحدد الموديولات المطلوبة، ونضع خطة التنفيذ."
            />
            <FeatureCard
              icon={<Settings className="w-6 h-6 text-[#8B2CF5]" />}
              title="2. الإعداد والتخصيص"
              description="نظبط النظام حسب هيكل شركتك: شجرة الحسابات، المنتجات، الصلاحيات."
            />
            <FeatureCard
              icon={<GraduationCap className="w-6 h-6 text-[#FF4FD8]" />}
              title="3. التدريب"
              description="ندرب فريقك على استخدام النظام بجلسات تدريبية تفاعلية."
            />
            <FeatureCard
              icon={<Rocket className="w-6 h-6 text-[#FF6636]" />}
              title="4. الإطلاق"
              description="نشغّل النظام وننقل البيانات من أنظمتك الحالية بسلاسة."
            />
            <FeatureCard
              icon={<HeadphonesIcon className="w-6 h-6 text-[#0A6CF1]" />}
              title="5. الدعم والمتابعة"
              description="فريق الدعم الفني معاك 24/7 بعد الإطلاق لضمان استقرار النظام."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-[#8B2CF5]" />}
              title="6. التحسين المستمر"
              description="نقيس الأداء، نسمع رأيك، ونطور النظام باستمرار."
            />
          </div>
        </Container>
      </div>
    </>
  );
}
