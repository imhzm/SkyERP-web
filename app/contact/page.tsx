import { createMetadata } from "@/lib/seo/metadata";
import { contactPageSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { getBreadcrumbs } from "@/lib/seo/breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ContactForm from "@/components/forms/ContactForm";
import { Phone, Mail } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: "تواصل مع Sky ERP",
  description: "تواصل معنا للاستفسار أو حجز تجربة أو معرفة أفضل باقة لشركتك.",
  path: "/contact",
  ogImage: "/images/og/contact-og.webp",
});

export default function ContactPage() {
  const breadcrumbs = getBreadcrumbs("/contact");
  return (
    <>
      <JsonLd data={contactPageSchema()} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <div className="pt-28 pb-20">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <SectionHeading title="تواصل معنا" subtitle="احنا هنا عشان نساعدك" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            <GlassCard className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0A6CF1]/20 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-[#0A6CF1]" />
              </div>
              <div>
                <h3 className="text-white font-medium">واتساب</h3>
                <a href={`https://wa.me/${SITE.whatsapp}`} className="text-white/50 text-sm hover:text-[#0A6CF1] transition-colors">{SITE.whatsapp}</a>
              </div>
            </GlassCard>

            <GlassCard className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#8B2CF5]/20 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-[#8B2CF5]" />
              </div>
              <div>
                <h3 className="text-white font-medium">البريد الإلكتروني</h3>
                <a href={`mailto:${SITE.email}`} className="text-white/50 text-sm hover:text-[#8B2CF5] transition-colors">{SITE.email}</a>
              </div>
            </GlassCard>
          </div>

          <div className="max-w-xl mx-auto">
            <ContactForm />
          </div>
        </Container>
      </div>
    </>
  );
}
