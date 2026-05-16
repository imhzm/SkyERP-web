import { SITE } from "@/lib/constants";
import type { BreadcrumbItem } from "./breadcrumbs";

export function softwareSchema(pageName?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: pageName ? `${SITE.name} - ${pageName}` : SITE.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: SITE.description,
    url: SITE.url,
    brand: {
      "@type": "Brand",
      name: SITE.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Sky Wave",
      url: "https://skywaveads.com",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "EGP",
      availability: "https://schema.org/InStock",
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}${SITE.logo}`,
    sameAs: [
      `https://wa.me/${SITE.whatsapp}`,
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "ar",
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  const validItems = items.filter((item) => item.href);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: validItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${SITE.url}${item.href}`,
    })),
  };
}

export function faqSchema(questions: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

export function serviceSchema(name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: SITE.name,
    },
  };
}

export function productSchema(name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    brand: {
      "@type": "Brand",
      name: SITE.name,
    },
  };
}

export function contactPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `تواصل مع ${SITE.name}`,
    description: "تواصل معنا للاستفسار أو حجز تجربة",
  };
}

export function aboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `عن ${SITE.name}`,
    description: "تعرف على رؤية Sky ERP",
  };
}
