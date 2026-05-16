import { createMetadata } from "@/lib/seo/metadata";
import IndustryDetail from "../details.client";

export const metadata = createMetadata({
  title: "ERP للصيانة",
  description: "إدارة طلبات الصيانة، الفنيين، قطع الغيار، المواعيد والفواتير.",
  path: "/industries/maintenance",
  ogImage: "/images/og/maintenance-og.webp",
});

export default function MaintenancePage() {
  return <IndustryDetail id="maintenance" />;
}
