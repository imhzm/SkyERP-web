import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "برنامج إدارة مخازن ومخزون",
  description: "تابع المخازن، المنتجات، الجرد، التحويلات، الباركود وتنبيهات نقص الكمية بسهولة.",
  path: "/apps/inventory",
  ogImage: "/images/og/inventory-og.webp",
});

export { default } from "./page.client";
