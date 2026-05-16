import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "ERP للمحلات ونقاط البيع",
  description: "كيف يساعد نظام ERP في إدارة المحلات التجارية ونقاط البيع وربط المخزون بالمبيعات.",
  path: "/blog/erp-retail-pos",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="ERP للمحلات ونقاط البيع"
      description="كيف يساعد ERP في إدارة المحلات وPOS"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
