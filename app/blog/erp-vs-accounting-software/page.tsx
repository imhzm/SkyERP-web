import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "الفرق بين ERP وبرنامج الحسابات",
  description: "مقارنة شاملة بين أنظمة ERP وبرامج المحاسبة التقليدية وأيهما更适合 لشركتك.",
  path: "/blog/erp-vs-accounting-software",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="الفرق بين ERP وبرنامج الحسابات"
      description="مقارنة شاملة تعرفك الفرق بين نظام ERP المتكامل وبرامج المحاسبة التقليدية"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
