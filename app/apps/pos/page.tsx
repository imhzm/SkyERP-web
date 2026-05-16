import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "برنامج كاشير POS متصل بالمخزون",
  description: "نقطة بيع سريعة للمحلات والفروع مع باركود وطباعة فواتير وربط مباشر بالحسابات والمخزون.",
  path: "/apps/pos",
  ogImage: "/images/og/pos-og.webp",
});

export { default } from "./page.client";
