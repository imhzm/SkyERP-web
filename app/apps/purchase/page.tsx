import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "نظام مشتريات وموردين",
  description: "أدِر طلبات الشراء، أوامر الشراء، الموردين، الفواتير والاستلامات من مكان واحد.",
  path: "/apps/purchase",
  ogImage: "/images/og/purchase-og.webp",
});

export { default } from "./page.client";
