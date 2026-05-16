import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "ERP في السعودية: ماذا تحتاج الشركات؟",
  description: "دليل شامل لاختيار ERP في السعودية مع مراعاة متطلبات ZATCA والضريبة المحلية.",
  path: "/blog/erp-saudi-arabia",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="ERP في السعودية: ماذا تحتاج الشركات؟"
      description="دليل ERP للشركات في السعودية"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
