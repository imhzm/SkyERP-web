import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "برنامج إدارة مخزون للشركات",
  description: "تعرف على أهم مميزات برنامج إدارة المخزون وكيف يساعد في تحسين عمليات المخازن.",
  path: "/blog/inventory-management-software",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="برنامج إدارة مخزون للشركات"
      description="أهم مميزات برنامج إدارة المخزون للشركات"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
