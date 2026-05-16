import { createMetadata } from "@/lib/seo/metadata";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata = createMetadata({
  title: "سياسة الخصوصية",
  description: "سياسة الخصوصية لـ Sky ERP.",
  path: "/privacy-policy",
  ogImage: "/images/og/privacy-og.webp",
  noIndex: true,
});

export default function PrivacyPage() {
  return (
    <div className="pt-28 pb-20">
      <Container>
        <SectionHeading title="سياسة الخصوصية" />
        <div className="max-w-3xl mx-auto text-white/60 text-sm leading-relaxed space-y-4">
          <p>سياسة الخصوصية الخاصة بـ Sky ERP. يتم تحديث هذه الصفحة باستمرار.</p>
        </div>
      </Container>
    </div>
  );
}
