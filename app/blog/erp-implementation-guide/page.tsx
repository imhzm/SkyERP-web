import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "خطوات تطبيق ERP داخل شركتك",
  description: "دليل خطوة بخطوة لتطبيق ERP في شركتك من التخطيط إلى الإطلاق والتشغيل.",
  path: "/blog/erp-implementation-guide",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="خطوات تطبيق ERP داخل شركتك"
      description="دليل خطوة بخطوة من التخطيط إلى الإطلاق"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
