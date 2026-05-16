import { createMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, aboutPageSchema } from "@/lib/seo/schema";
import { getBreadcrumbs } from "@/lib/seo/breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";
import { SITE } from "@/lib/constants";
import { Eye, Target, Shield, Heart } from "lucide-react";

export const metadata = createMetadata({
  title: "عن Sky ERP",
  description: "تعرف على رؤية Sky ERP في بناء نظام إدارة أعمال عربي ذكي وسهل للشركات.",
  path: "/about",
  ogImage: "/images/og/about-og.webp",
});

export default function AboutPage() {
  const breadcrumbs = getBreadcrumbs("/about");
  return (
    <>
      <JsonLd data={aboutPageSchema()} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <div className="pt-28 pb-20">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <SectionHeading
            title="عن Sky ERP"
            subtitle="نظام واحد. رؤية أوضح. شركة أقوى."
          />

          <div className="max-w-3xl mx-auto mb-12">
            <GlassCard>
              <p className="text-white/60 leading-relaxed mb-4">
                {SITE.description}
              </p>
              <p className="text-white/60 leading-relaxed">
                Sky ERP هو نتاج خبرة فريق Sky Wave في مجال التسويق الرقمي وتحليل البيانات.
                بنينا النظام عشان يكون أداة عملية للشركات العربية تدير كل حاجة من مكان واحد —
                بدون تعقيد Odoo وبدون محدودية برامج المحاسبة التقليدية.
              </p>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <GlassCard className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#0A6CF1]/20 flex items-center justify-center">
                <Eye className="w-7 h-7 text-[#0A6CF1]" />
              </div>
              <h3 className="text-white font-semibold mb-2">رؤيتنا</h3>
              <p className="text-white/50 text-sm">نكون المنصة الأولى عربيًا لإدارة الشركات بذكاء.</p>
            </GlassCard>

            <GlassCard className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#8B2CF5]/20 flex items-center justify-center">
                <Target className="w-7 h-7 text-[#8B2CF5]" />
              </div>
              <h3 className="text-white font-semibold mb-2">مهمتنا</h3>
              <p className="text-white/50 text-sm">نوفر للشركات العربية أدوات عالمية بسعر مناسب ولغة مفهومة.</p>
            </GlassCard>

            <GlassCard className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#FF4FD8]/20 flex items-center justify-center">
                <Shield className="w-7 h-7 text-[#FF4FD8]" />
              </div>
              <h3 className="text-white font-semibold mb-2">قيمنا</h3>
              <p className="text-white/50 text-sm">شفافية، تكامل، تحسين مستمر، وData-Driven.</p>
            </GlassCard>

            <GlassCard className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#FF6636]/20 flex items-center justify-center">
                <Heart className="w-7 h-7 text-[#FF6636]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Sky Wave</h3>
              <p className="text-white/50 text-sm">مبني على فلسفة Sky Wave في التحليل الرقمي وتحسين الأداء.</p>
            </GlassCard>
          </div>
        </Container>
      </div>
    </>
  );
}
