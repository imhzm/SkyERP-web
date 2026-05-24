"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Check, Square, ToggleLeft, BarChart3 } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";

const steps = [
  {
    icon: Square,
    title: "ثبت التطبيقات اللي تحتاجها",
    description: "اختر من 15+ موديول حسب احتياج شركتك — حسابات، مبيعات، مخزون، HR، CRM، وغيرهم",
  },
  {
    icon: ToggleLeft,
    title: "فعل أو أوقف أي App",
    description: "تحكم كامل — شغّل اللي تحتاجه في أي وقت وأوقف اللي مش مستخدم. النظام يتكيف معاك",
  },
  {
    icon: BarChart3,
    title: "ابدأ بسيط وكبّر مع الوقت",
    description: "ابدأ بموديول واحد أو اتنين، وزود مع نمو شركتك. نظام Modular حقيقي — مش تضطر تشتري حاجة مش محتاجها",
  },
];

export default function MarketplaceSection() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A6CF1]/5 to-transparent" />
      <Container className="relative z-10">
        <SectionHeading
          title="App Marketplace — انت اللي تختار"
          subtitle="نظام Modular يعني أنت فقط اللي تقرر إيه التطبيقات اللي تشتغل في شركتك. زود أو قلّل حسب ما تحتاج"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden glass p-2"
          >
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src="/images/skyerp/erp-modular-تطبيقات-اعمال.webp"
                alt="Sky ERP App Marketplace - تطبيقات متكاملة للشركات"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <GlassCard className="flex items-start gap-4 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A6CF1]/20 to-[#8B2CF5]/20 flex items-center justify-center shrink-0">
                    <step.icon className="w-7 h-7 text-[#0A6CF1]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                    <p className="text-white/50 text-sm">{step.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
