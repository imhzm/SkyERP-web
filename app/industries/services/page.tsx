import { createMetadata } from "@/lib/seo/metadata";
import IndustryDetail from "../details.client";

export const metadata = createMetadata({
  title: "ERP لشركات الخدمات",
  description: "إدارة العملاء، المشاريع، الفواتير، التذاكر والتقارير لشركات الخدمات.",
  path: "/industries/services",
  ogImage: "/images/og/services-og.webp",
});

export default function ServicesPage() {
  return <IndustryDetail id="services" />;
}
