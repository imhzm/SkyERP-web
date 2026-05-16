import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Sky ERP Marketplace",
  description: "ثبّت التطبيقات التي تحتاجها وشغّل نظامك كمنصة Modular قابلة للتوسع.",
  path: "/apps/marketplace",
  ogImage: "/images/og/marketplace-og.webp",
});

export { default } from "./page.client";
