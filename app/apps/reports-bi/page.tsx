import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "تقارير BI ولوحات تحكم",
  description: "تقارير مالية، مبيعات، مخزون، HR، CRM ولوحات مؤشرات لحظية.",
  path: "/apps/reports-bi",
  ogImage: "/images/og/reports-bi-og.webp",
});

export { default } from "./page.client";
