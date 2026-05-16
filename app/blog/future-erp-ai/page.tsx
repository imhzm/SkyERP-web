import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "مستقبل ERP مع الذكاء الاصطناعي",
  description: "كيف يغير الذكاء الاصطناعي مستقبل أنظمة ERP ويجعل إدارة الشركات أكثر ذكاءً.",
  path: "/blog/future-erp-ai",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="مستقبل ERP مع الذكاء الاصطناعي"
      description="كيف يغير AI مستقبل أنظمة ERP"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
