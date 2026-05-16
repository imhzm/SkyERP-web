import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "CRM لإدارة العملاء والصفقات",
  description: "تابع العملاء والصفقات والمكالمات والمتابعات وسجل كل تواصل داخل Customer 360.",
  path: "/apps/crm",
  ogImage: "/images/og/crm-og.webp",
});

export { default } from "./page.client";
