import { createMetadata } from "@/lib/seo/metadata";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata = createMetadata({
  title: "الشروط والأحكام",
  description: "الشروط والأحكام لـ Sky ERP.",
  path: "/terms",
  ogImage: "/images/og/terms-og.webp",
  noIndex: true,
});

export default function TermsPage() {
  return (
    <div className="pt-28 pb-20">
      <Container>
        <SectionHeading title="الشروط والأحكام" />
        <div className="max-w-3xl mx-auto text-white/60 text-sm leading-relaxed space-y-4">
          <p>الشروط والأحكام الخاصة بـ Sky ERP. يتم تحديث هذه الصفحة باستمرار.</p>
        </div>
      </Container>
    </div>
  );
}
