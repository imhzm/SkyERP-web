"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";
import { generalFAQs } from "@/data/faqs";

export default function FAQSection() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A6CF1]/5 to-transparent" />
      <Container className="relative z-10">
        <SectionHeading
          title="الأسئلة الشائعة"
          subtitle="كل اللي محتاج تعرفه عن Sky ERP في سؤال وجواب — من التسجيل للفوترة للدعم الفني"
        />

        <div className="max-w-3xl mx-auto space-y-4">
          {generalFAQs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <GlassCard hover={false}>
                <h3 className="text-white font-medium mb-2">{faq.question}</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
