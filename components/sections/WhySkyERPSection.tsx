"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Globe,
  Settings,
  Users,
  Building2,
  Bot,
  MessageCircle,
  BarChart3,
  Shield,
} from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";

const reasons = [
  { icon: Globe, title: "عربي وسهل", description: "واجهة عربية بالكامل مصممة خصيصًا للشركات العربية" },
  { icon: Building2, title: "مناسب لمصر والخليج", description: "يدعم قوانين الضرائب المحلية ونظم العمل في كل دولة" },
  { icon: Settings, title: "قابل للتخصيص", description: "ظبط النظام زي ما تحب يناسب شركتك" },
  { icon: Users, title: "Multi-branch", description: "إدارة فروع متعددة من لوحة تحكم واحدة" },
  { icon: Bot, title: "AI Assistant", description: "مساعد ذكي يجيب على أسئلتك فوريًا" },
  { icon: MessageCircle, title: "WhatsApp-first CRM", description: "CRM متكامل مع واتساب لإدارة العملاء" },
  { icon: BarChart3, title: "تقارير لحظية", description: "تقارير ولوحات مؤشرات آنية لكل departments" },
  { icon: Shield, title: "أمان وصلاحيات", description: "صلاحيات دقيقة، Audit Logs، 2FA وتشفير" },
];

export default function WhySkyERPSection() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FF4FD8]/5 to-transparent" />
      <Container className="relative z-10">
        <SectionHeading
          title="ليه Sky ERP؟"
          subtitle="مبني على نفس فلسفة Sky Wave: Data & AI-Driven، قياس مستمر، تكامل، شفافية، وتحسين مستمر"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden glass p-2 order-2 lg:order-1"
          >
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src="/images/skyerp/erp-digital-تحول-رقمي.webp"
                alt="Sky ERP - التحول الرقمي للشركات"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 600px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 order-1 lg:order-2">
            {reasons.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <GlassCard className="text-center h-full">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#0A6CF1]/20 to-[#FF4FD8]/20 flex items-center justify-center">
                    <reason.icon className="w-6 h-6 text-[#FF4FD8]" />
                  </div>
                  <h3 className="text-white font-semibold mb-1 text-sm">{reason.title}</h3>
                  <p className="text-white/50 text-xs">{reason.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
