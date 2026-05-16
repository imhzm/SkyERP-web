import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "أهمية CRM داخل نظام ERP",
  description: "اكتشف لماذا يعتبر CRM جزء أساسي من أي نظام ERP وكيف يساعد في تحسين المبيعات.",
  path: "/blog/crm-importance-in-erp",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="أهمية CRM داخل نظام ERP"
      description="لماذا CRM أساسي في نظام ERP"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
