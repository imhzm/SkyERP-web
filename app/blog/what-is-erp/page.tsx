import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "ما هو نظام ERP؟",
  description: "تعرف على مفهوم نظام ERP وأهميته للشركات وكيف يساعد في إدارة الحسابات والمخازن والمبيعات.",
  path: "/blog/what-is-erp",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="ما هو نظام ERP؟"
      description="تعرف على نظام تخطيط الموارد المؤسسية (ERP) وأهميته للشركات"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
