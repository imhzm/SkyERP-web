import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "كيف تساعد تقارير BI في نمو الشركة؟",
  description: "تعرف على أهمية تقارير BI ولوحات المؤشرات في تحسين أداء الشركة واتخاذ القرارات.",
  path: "/blog/bi-reports-business-growth",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="كيف تساعد تقارير BI في نمو الشركة؟"
      description="أهمية تقارير BI في تحسين أداء الشركة"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
