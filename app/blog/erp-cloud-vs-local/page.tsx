import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "ERP Cloud vs ERP Local",
  description: "مقارنة شاملة بين ERP السحابي و ERP المحلي: المميزات والعيوب وأيهما أفضل لشركتك.",
  path: "/blog/erp-cloud-vs-local",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="ERP Cloud vs ERP Local"
      description="مقارنة شاملة بين Cloud ERP و On-Premise ERP"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
