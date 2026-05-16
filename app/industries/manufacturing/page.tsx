import { createMetadata } from "@/lib/seo/metadata";
import IndustryDetail from "../details.client";

export const metadata = createMetadata({
  title: "ERP للمصانع",
  description: "إدارة التصنيع، الخامات، الإنتاج، الجودة، المخازن والتكاليف للمصانع.",
  path: "/industries/manufacturing",
  ogImage: "/images/og/manufacturing-industry-og.webp",
});

export default function ManufacturingIndustryPage() {
  return <IndustryDetail id="manufacturing" />;
}
