"use client";

import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { getBreadcrumbs } from "@/lib/seo/breadcrumbs";

type Props = {
  title: string;
  description: string;
  date?: string;
  author?: string;
  content?: string;
};

export default function BlogArticlePage({ title, description, date, author }: Props) {
  const breadcrumbs = getBreadcrumbs("/blog");

  return (
    <div className="pt-28 pb-20">
      <Container>
        <Breadcrumbs items={breadcrumbs} />
        <article className="max-w-3xl mx-auto">
          <Badge variant="primary" className="mb-4">مدونة</Badge>
          <SectionHeading title={title} subtitle={description} align="right" />
          <div className="flex items-center gap-4 text-white/30 text-sm mb-8">
            {date && <span>{date}</span>}
            {author && <span>بواسطة {author}</span>}
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-white/50 leading-relaxed">
              المقال قيد الإعداد. قريبًا هنشر المحتوى الكامل هنا.
            </p>
          </div>
          <div className="mt-12 text-center">
            <a href="/blog"><Button variant="secondary">العودة للمدونة</Button></a>
          </div>
        </article>
      </Container>
    </div>
  );
}
