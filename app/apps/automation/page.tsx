import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "أتمتة العمليات داخل ERP",
  description: "أنشئ قواعد تلقائية للمتابعة، التنبيهات، الفواتير، التذاكر والموافقات.",
  path: "/apps/automation",
  ogImage: "/images/og/automation-og.webp",
});

export { default } from "./page.client";
