import { createMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { getBreadcrumbs } from "@/lib/seo/breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata = createMetadata({
  title: "مدونة Sky ERP",
  description: "مقالات عن ERP، إدارة الشركات، الحسابات، المخازن، CRM والتحول الرقمي.",
  path: "/blog",
  ogImage: "/images/og/blog-og.webp",
});

export default function BlogPage() {
  const breadcrumbs = getBreadcrumbs("/blog");
  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <div className="pt-28 pb-20">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <SectionHeading title="مدونة Sky ERP" subtitle="مقالات وأدلة عن ERP وإدارة الشركات" />
          <p className="text-white/50 text-center">قريبًا… المقالات الأولى قيد الإعداد</p>
        </Container>
      </div>
    </>
  );
}
