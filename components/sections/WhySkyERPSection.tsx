"use client";

import { motion } from "framer-motion";
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <GlassCard className="text-center h-full">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0A6CF1]/20 to-[#FF4FD8]/20 flex items-center justify-center">
                  <reason.icon className="w-7 h-7 text-[#FF4FD8]" />
                </div>
                <h3 className="text-white font-semibold mb-2">{reason.title}</h3>
                <p className="text-white/50 text-sm">{reason.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
