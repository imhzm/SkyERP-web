import { createMetadata } from "@/lib/seo/metadata";
import IndustryDetail from "../details.client";

export const metadata = createMetadata({
  title: "ERP للتجارة الإلكترونية",
  description: "ربط متجرك الإلكتروني بالمخزون والحسابات والمبيعات تلقائيًا.",
  path: "/industries/ecommerce",
  ogImage: "/images/og/ecommerce-og.webp",
});

export default function EcommercePage() {
  return <IndustryDetail id="ecommerce" />;
}
