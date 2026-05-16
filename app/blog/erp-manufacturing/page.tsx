import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "ERP للمصانع: أهم المميزات",
  description: "تعرف على أهم مميزات نظام ERP للمصانع: إدارة الإنتاج، BOM، الجودة، والتكاليف.",
  path: "/blog/erp-manufacturing",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="ERP للمصانع: أهم المميزات"
      description="أهم مميزات ERP للمصانع وشركات التصنيع"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
