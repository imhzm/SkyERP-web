import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "برنامج حسابات ومخازن ومبيعات في نظام واحد",
  description: "تعرف على مميزات وجود برنامج حسابات ومخازن ومبيعات في نظام ERP متكامل واحد.",
  path: "/blog/accounting-inventory-sales-one-system",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="برنامج حسابات ومخازن ومبيعات في نظام واحد"
      description="مميزات دمج الحسابات والمخازن والمبيعات في ERP واحد"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
