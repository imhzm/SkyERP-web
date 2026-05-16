import { createMetadata } from "@/lib/seo/metadata";
import IndustryDetail from "../details.client";

export const metadata = createMetadata({
  title: "ERP لوكالات التسويق والشركات الرقمية",
  description: "أدِر العملاء، المشاريع، الفرق، الفواتير، الحملات والتقارير من مكان واحد.",
  path: "/industries/agencies",
  ogImage: "/images/og/agencies-og.webp",
});

export default function AgenciesPage() {
  return <IndustryDetail id="agencies" />;
}
