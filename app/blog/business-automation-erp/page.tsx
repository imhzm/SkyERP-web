import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "أتمتة الأعمال داخل ERP",
  description: "كيف تساعد الأتمتة داخل نظام ERP في توفير الوقت وتقليل الأخطاء وزيادة الإنتاجية.",
  path: "/blog/business-automation-erp",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="أتمتة الأعمال داخل ERP"
      description="كيف تساعد الأتمتة داخل ERP في زيادة الإنتاجية"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
