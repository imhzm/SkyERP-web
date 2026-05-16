"use client";

import { motion } from "framer-motion";
import { Check, Square, ToggleLeft, BarChart3 } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";

const steps = [
  {
    icon: Square,
    title: "ثبت التطبيقات اللي تحتاجها",
    description: "اختر من 15+ موديول حسب احتياج شركتك",
  },
  {
    icon: ToggleLeft,
    title: "فعل أو أوقف أي App",
    description: "تحكم كامل في التطبيقات - شغّل اللي تحتاجه و أوقف اللي مش محتاجه",
  },
  {
    icon: BarChart3,
    title: "ابدأ بسيط وكبّر مع الوقت",
    description: "ابدأ بموديول واحد وزود مع نمو شركتك",
  },
];

export default function MarketplaceSection() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A6CF1]/5 to-transparent" />
      <Container className="relative z-10">
        <SectionHeading
          title="App Marketplace"
          subtitle="نظام Modular - انت اللي تختار"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <GlassCard className="text-center h-full">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0A6CF1]/20 to-[#8B2CF5]/20 flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-[#0A6CF1]" />
                </div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm">{step.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
