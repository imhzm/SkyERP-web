import { createMetadata } from "@/lib/seo/metadata";
import IndustryDetail from "../details.client";

export const metadata = createMetadata({
  title: "ERP للتوزيع",
  description: "إدارة الموزعين، الأسطول، المخازن، الطلبات والتسليمات.",
  path: "/industries/distribution",
  ogImage: "/images/og/distribution-og.webp",
});

export default function DistributionPage() {
  return <IndustryDetail id="distribution" />;
}
