import { createMetadata } from "@/lib/seo/metadata";
import { softwareSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { getBreadcrumbs } from "@/lib/seo/breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ModuleGrid from "@/components/sections/ModuleGrid";

export const metadata = createMetadata({
  title: "تطبيقات Sky ERP",
  description: "اختار التطبيقات التي تحتاجها: حسابات، مخزون، مبيعات، CRM، HR، POS، تصنيع وتقارير.",
  path: "/apps",
  ogImage: "/images/og/apps-og.webp",
});

export default function AppsPage() {
  const breadcrumbs = getBreadcrumbs("/apps");
  return (
    <>
      <JsonLd data={softwareSchema("التطبيقات")} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <div className="pt-28 pb-20">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <SectionHeading title="كل تطبيقات Sky ERP" subtitle="اختر التطبيقات اللي تناسب شركتك" />
          <ModuleGrid />
        </Container>
      </div>
    </>
  );
}
