import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "إدارة المشاريع والمهام",
  description: "تابع المشاريع والمهام والتايم شيت والتسليمات وتكلفة كل مشروع بسهولة.",
  path: "/apps/projects",
  ogImage: "/images/og/projects-og.webp",
});

export { default } from "./page.client";
