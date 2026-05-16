import { createMetadata } from "@/lib/seo/metadata";
import IndustryDetail from "../details.client";

export const metadata = createMetadata({
  title: "ERP للمحلات والمعارض",
  description: "نظام شامل للمبيعات، الكاشير، المخازن، العملاء والفروع للمحلات والمعارض.",
  path: "/industries/retail",
  ogImage: "/images/og/retail-og.webp",
});

export default function RetailPage() {
  return <IndustryDetail id="retail" />;
}
