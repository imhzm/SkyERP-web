import { createMetadata } from "@/lib/seo/metadata";
import { softwareSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { getBreadcrumbs } from "@/lib/seo/breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata = createMetadata({
  title: "مميزات Sky ERP",
  description: "اكتشف مميزات Sky ERP في إدارة الحسابات والمبيعات والمخزون والموظفين والأتمتة والتقارير.",
  path: "/features",
  ogImage: "/images/og/features-og.webp",
});

export default function FeaturesPage() {
  const breadcrumbs = getBreadcrumbs("/features");
  return (
    <>
      <JsonLd data={softwareSchema()} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <div className="pt-28 pb-20">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <SectionHeading title="مميزات Sky ERP" subtitle="كل المميزات اللي تخلي إدارة شركتك أسهل وأسرع" />
        </Container>
      </div>
    </>
  );
}
