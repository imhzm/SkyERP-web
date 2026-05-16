import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "ERP في الإمارات: مميزات مهمة",
  description: "تعرف على أهم مميزات ERP للشركات في الإمارات العربية المتحدة ومتطلبات السوق.",
  path: "/blog/erp-uae",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="ERP في الإمارات: مميزات مهمة"
      description="مميزات ERP للشركات في الإمارات"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
