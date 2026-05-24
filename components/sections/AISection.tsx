"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MessageCircle, TrendingUp, Package, DollarSign, Trophy, Users2 } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";
import GradientText from "@/components/ui/GradientText";

const examples = [
  { icon: Users2, text: "مين العملاء المتأخرين في الدفع؟" },
  { icon: Package, text: "إيه المنتجات اللي قربت تخلص؟" },
  { icon: TrendingUp, text: "إيه أفضل فرع مبيعات؟" },
  { icon: DollarSign, text: "كام ربح الشهر ده؟" },
  { icon: Trophy, text: "مين أكتر مندوب حقق مبيعات؟" },
];

export default function AISection() {
  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          title="اسأل نظامك… وخد قرارك أسرع"
          subtitle="المساعد الذكي بيفهم أسئلتك بالعامية ويحللك البيانات فوريًا — من غير تقارير معقدة"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#FF4FD8]/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#FF4FD8]" />
                </div>
                <div>
                  <GradientText className="font-semibold">AI Assistant</GradientText>
                  <div className="text-white/30 text-xs">المساعد الذكي</div>
                </div>
              </div>

              <div className="space-y-3">
                {examples.map((ex, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                  >
                    <ex.icon className="w-5 h-5 text-[#0A6CF1]" />
                    <span className="text-white/70 text-sm">{ex.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden glass p-2"
          >
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src="/images/skyerp/crm-analytics-تحليلات.webp"
                alt="Sky ERP AI Assistant - تحليلات ذكية للبيانات"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            </div>

          </motion.div>
        </div>
      </Container>
    </section>
  );
}
