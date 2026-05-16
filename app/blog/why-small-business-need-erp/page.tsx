import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "لماذا تحتاج الشركات الصغيرة إلى ERP؟",
  description: "اكتشف كيف يمكن لنظام ERP أن يساعد الشركات الصغيرة في النمو والتنظيم وتوفير الوقت والمال.",
  path: "/blog/why-small-business-need-erp",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="لماذا تحتاج الشركات الصغيرة إلى ERP؟"
      description="تعرف على فوائد ERP للشركات الصغيرة والمتوسطة"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
