import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "ERP للتصنيع والمصانع",
  description: "أوامر تصنيع، BOM، مراحل إنتاج، جودة، هالك، تكلفة إنتاج وتقارير مصانع.",
  path: "/apps/manufacturing",
  ogImage: "/images/og/manufacturing-og.webp",
});

export { default } from "./page.client";
