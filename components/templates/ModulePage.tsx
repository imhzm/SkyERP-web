"use client";

import { CheckCircle, Target, Workflow, BarChart3, Share2, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { getBreadcrumbs } from "@/lib/seo/breadcrumbs";
import { softwareSchema, faqSchema } from "@/lib/seo/schema";
import { modules } from "@/data/modules";

type Props = {
  moduleId: string;
  hero: string;
  problem: string;
  sections: string[];
  workflow: { step: string; desc: string }[];
  reports: string[];
  integrations: string[];
  audience: string[];
  faqs: { question: string; answer: string }[];
};

export function ModulePage({
  moduleId,
  hero,
  problem,
  sections,
  workflow,
  reports,
  integrations,
  audience,
  faqs,
}: Props) {
  const mod = modules.find((m) => m.id === moduleId);
  const breadcrumbs = getBreadcrumbs(`/apps/${moduleId}`);

  return (
    <>
      <JsonLd data={softwareSchema(mod?.name)} />
      <JsonLd data={faqSchema(faqs)} />
      <div className="pt-28 pb-20">
        <Container>
          <Breadcrumbs items={breadcrumbs} />

          {/* 1. Hero */}
          <div className="mb-16">
            <Badge variant="primary" className="mb-4">{mod?.name}</Badge>
            <SectionHeading title={hero} subtitle={mod?.description} align="right" />
            <div className="flex flex-wrap gap-3 mt-8">
              <a href="/demo"><Button>احجز Demo مجاني</Button></a>
              <a href={`/apps/${moduleId}`}><Button variant="secondary">شاهد المميزات</Button></a>
            </div>
          </div>

          {/* 2. Problem */}
          <div className="mb-16">
            <SectionHeading
              title="المشكلة اللي بيحلها"
              subtitle={problem}
              align="right"
              gradient={false}
            />
          </div>

          {/* 3. Features */}
          <div className="mb-16">
            <SectionHeading
              title="المميزات"
              subtitle="كل اللي تحتاجه في مكان واحد"
              align="right"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map((section, i) => (
                <GlassCard key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#0A6CF1] shrink-0" />
                  <span className="text-white/70">{section}</span>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* 4. Workflow */}
          {workflow.length > 0 && (
            <div className="mb-16">
              <SectionHeading
                title="طريقة العمل"
                subtitle="خطوات بسيطة ومنطقية"
                align="right"
              />
              <div className="space-y-4">
                {workflow.map((w, i) => (
                  <GlassCard key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A6CF1] to-[#8B2CF5] flex items-center justify-center text-white font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">{w.step}</h4>
                      <p className="text-white/50 text-sm">{w.desc}</p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* 5. Reports */}
          {reports.length > 0 && (
            <div className="mb-16">
              <SectionHeading
                title="تقارير الموديول"
                subtitle="تقارير لحظية تدعم قراراتك"
                align="right"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.map((r, i) => (
                  <GlassCard key={i} className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-[#8B2CF5] shrink-0" />
                    <span className="text-white/70">{r}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* 6. Integrations */}
          {integrations.length > 0 && (
            <div className="mb-16">
              <SectionHeading
                title="التكامل مع باقي النظام"
                subtitle="كل حاجة شغالة مع بعض"
                align="right"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((intg, i) => (
                  <GlassCard key={i} className="flex items-center gap-3">
                    <Share2 className="w-5 h-5 text-[#FF4FD8] shrink-0" />
                    <span className="text-white/70">{intg}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* 7. Audience */}
          {audience.length > 0 && (
            <div className="mb-16">
              <SectionHeading
                title="لمن يناسب هذا الموديول؟"
                subtitle="مصمم خصيصًا لـ"
                align="right"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {audience.map((a, i) => (
                  <GlassCard key={i} className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#FF6636] shrink-0" />
                    <span className="text-white/70">{a}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* 8. FAQ */}
          {faqs.length > 0 && (
            <div className="mb-16">
              <SectionHeading
                title="الأسئلة الشائعة"
                align="right"
              />
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <GlassCard key={i} hover={false}>
                    <h4 className="text-white font-medium mb-2">{faq.question}</h4>
                    <p className="text-white/50 text-sm">{faq.answer}</p>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* 9. CTA */}
          <div className="text-center glass rounded-2xl p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              جاهز تجرب {mod?.name}؟
            </h3>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              احجز Demo مجاني وشوف بنفسك كيف {mod?.name} في Sky ERP يقدر يغير طريقة إدارة شركتك
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/demo"><Button size="lg">احجز Demo مجاني</Button></a>
              <Link href="/apps">
                <Button variant="outline" size="lg" className="gap-2">
                  استعرض كل الموديولات <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
