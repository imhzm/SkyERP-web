import { createMetadata } from "@/lib/seo/metadata";
import IndustryDetail from "../details.client";

export const metadata = createMetadata({
  title: "ERP للمطاعم",
  description: "إدارة الطلبات، المنيو، المطبخ، المخزون، الكاشير والفروع.",
  path: "/industries/restaurants",
  ogImage: "/images/og/restaurants-og.webp",
});

export default function RestaurantsPage() {
  return <IndustryDetail id="restaurants" />;
}
