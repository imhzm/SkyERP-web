import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "مساعد ذكاء اصطناعي داخل ERP",
  description: "اسأل النظام عن المبيعات والمخزون والعملاء والتقارير واحصل على تحليلات فورية.",
  path: "/apps/ai-assistant",
  ogImage: "/images/og/ai-assistant-og.webp",
});

export { default } from "./page.client";
