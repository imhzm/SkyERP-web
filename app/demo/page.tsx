import { createMetadata } from "@/lib/seo/metadata";
import { contactPageSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { getBreadcrumbs } from "@/lib/seo/breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import DemoForm from "@/components/forms/DemoForm";

export const metadata = createMetadata({
  title: "احجز Demo مجاني",
  description: "احجز عرض توضيحي مجاني وشاهد كيف يساعد Sky ERP في تنظيم شركتك.",
  path: "/demo",
  ogImage: "/images/og/demo-og.webp",
});

export default function DemoPage() {
  const breadcrumbs = getBreadcrumbs("/demo");
  return (
    <>
      <JsonLd data={contactPageSchema()} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <div className="pt-28 pb-20">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <SectionHeading title="احجز Demo مجاني" subtitle="شوف Sky ERP بنفسك" />
          <DemoForm />
        </Container>
      </div>
    </>
  );
}
