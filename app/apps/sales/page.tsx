import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "نظام مبيعات وفواتير متكامل",
  description: "أدِر عروض الأسعار، أوامر البيع، الفواتير، التحصيلات وعمولات المندوبين.",
  path: "/apps/sales",
  ogImage: "/images/og/sales-og.webp",
});

export { default } from "./page.client";
