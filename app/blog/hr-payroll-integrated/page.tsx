import { createMetadata } from "@/lib/seo/metadata";
import BlogArticlePage from "@/components/templates/BlogArticle";

export const metadata = createMetadata({
  title: "برنامج HR ورواتب متكامل",
  description: "اكتشف مميزات نظام HR والرواتب المتكامل: حضور، إجازات، رواتب وتقييمات.",
  path: "/blog/hr-payroll-integrated",
  ogImage: "/images/og/blog-og.webp",
});

export default function Page() {
  return (
    <BlogArticlePage
      title="برنامج HR ورواتب متكامل"
      description="مميزات نظام HR والرواتب المتكامل"
      date="قيد النشر"
      author="فريق Sky ERP"
    />
  );
}
