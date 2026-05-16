import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "برنامج حسابات ERP متكامل",
  description: "أدِر القيود اليومية، الخزنة، البنوك، العملاء، الموردين والتقارير المالية داخل Sky ERP.",
  path: "/apps/accounting",
  ogImage: "/images/og/accounting-og.webp",
});

export { default } from "./page.client";
