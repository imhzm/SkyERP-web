import { createMetadata } from "@/lib/seo/metadata";
import { productSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { getBreadcrumbs } from "@/lib/seo/breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { PricingCard } from "@/components/cards";
import { pricingPlans } from "@/data/pricing";

export const metadata = createMetadata({
  title: "أسعار Sky ERP",
  description: "باقات مرنة حسب عدد المستخدمين والموديولات وحجم الشركة.",
  path: "/pricing",
  ogImage: "/images/og/pricing-og.webp",
});

export default function PricingPage() {
  const breadcrumbs = getBreadcrumbs("/pricing");
  return (
    <>
      <JsonLd data={productSchema("Sky ERP Plans", "اشتراكات Sky ERP للشركات")} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <div className="pt-28 pb-20">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <SectionHeading title="باقات مرنة تناسب كل الشركات" subtitle="اختار الباقة المناسبة لشركتك" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </Container>
      </div>
    </>
  );
}
