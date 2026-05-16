import { createMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { getBreadcrumbs } from "@/lib/seo/breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import SecuritySection from "@/components/sections/SecuritySection";

export const metadata = createMetadata({
  title: "أمان وخصوصية Sky ERP",
  description: "صلاحيات، Audit Logs، نسخ احتياطي، 2FA وحماية بيانات الشركات.",
  path: "/security",
  ogImage: "/images/og/security-og.webp",
});

export default function SecurityPage() {
  const breadcrumbs = getBreadcrumbs("/security");
  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <div className="pt-28 pb-20">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <SectionHeading title="أمان من الدرجة الأولى" subtitle="بيانات شركتك في أمان" />
          <SecuritySection />
        </Container>
      </div>
    </>
  );
}
