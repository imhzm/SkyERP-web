import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "كيف تختار برنامج ERP مناسب لشركتك؟",
  description: "دليل عملي لاختيار نظام ERP المناسب لشركتك مع 10 معايير أساسية يجب مراعاتها.",
  path: "/blog/how-to-choose-erp",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="كيف تختار برنامج ERP مناسب لشركتك؟"
      description="دليل عملي لاختيار نظام ERP مع 10 معايير أساسية"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
