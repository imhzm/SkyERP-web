import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "أفضل برنامج ERP للشركات في مصر",
  description: "دليل شامل لاختيار أفضل برنامج ERP في مصر 2025 - 2026 مع مقارنة المميزات والأسعار.",
  path: "/blog/best-erp-system-egypt",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="أفضل برنامج ERP للشركات في مصر"
      description="دليل شامل لاختيار أفضل برنامج ERP يناسب شركتك في مصر"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
