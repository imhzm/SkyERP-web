import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "أفضل بديل Odoo عربي للشركات",
  description: "ابحث عن بديل Odoo للشركات العربية؟ تعرف على Sky ERP كحل عربي متكامل لإدارة أعمالك.",
  path: "/blog/odoo-alternative-arabic-erp",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="أفضل بديل Odoo عربي للشركات"
      description="تعرف على Sky ERP كبديل عربي متكامل لنظام Odoo"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
