import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "لماذا تفشل الشركات في تطبيق ERP؟",
  description: "أهم أسباب فشل تطبيق ERP في الشركات وكيف تتجنبها لضمان نجاح المشروع.",
  path: "/blog/why-erp-implementation-fails",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="لماذا تفشل الشركات في تطبيق ERP؟"
      description="أسباب فشل ERP وكيف تتجنبها"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
