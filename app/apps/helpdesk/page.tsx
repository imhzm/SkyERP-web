import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "نظام خدمة عملاء وتذاكر دعم",
  description: "أدِر شكاوى العملاء وتذاكر الدعم وSLA والتصعيد والتقييم من منصة واحدة.",
  path: "/apps/helpdesk",
  ogImage: "/images/og/helpdesk-og.webp",
});

export { default } from "./page.client";
