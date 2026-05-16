import { createMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { getBreadcrumbs } from "@/lib/seo/breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import IntegrationsSection from "@/components/sections/IntegrationsSection";

export const metadata = createMetadata({
  title: "تكاملات Sky ERP",
  description: "ربط Sky ERP مع واتساب، الدفع، الشحن، الإيميل، Google Sheets وAPIs.",
  path: "/integrations",
  ogImage: "/images/og/integrations-og.webp",
});

export default function IntegrationsPage() {
  const breadcrumbs = getBreadcrumbs("/integrations");
  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <div className="pt-28 pb-20">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <SectionHeading
            title="التكاملات"
            subtitle="اربط Sky ERP مع أدواتك المفضلة"
          />
          <IntegrationsSection />
        </Container>
      </div>
    </>
  );
}
