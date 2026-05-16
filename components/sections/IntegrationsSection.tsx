"use client";

import { motion } from "framer-motion";
import {
  Link2,
  MessageCircle,
  CreditCard,
  Truck,
  Mail,
  Sheet,
  Code2,
  Database,
} from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";

const integrations = [
  { icon: MessageCircle, title: "واتساب", description: "ربط واتساب Business API للتواصل مع العملاء" },
  { icon: CreditCard, title: "بوابات الدفع", description: "تكامل مع Paymob, Fawry, Stripe" },
  { icon: Truck, title: "شركات الشحن", description: "ربط مع شركات الشحن لتتبع الطلبات" },
  { icon: Mail, title: "البريد الإلكتروني", description: "SMTP و Gmail و Outlook للمراسلات" },
  { icon: Sheet, title: "Google Sheets", description: "تصدير واستيراد البيانات من Google Sheets" },
  { icon: Code2, title: "REST API", description: "API مفتوح للتكامل مع أنظمتك الأخرى" },
];

export default function IntegrationsSection() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#8B2CF5]/5 to-transparent" />
      <Container className="relative z-10">
        <SectionHeading
          title="تكاملات قوية"
          subtitle="اربط Sky ERP مع أدواتك المفضلة"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard className="flex items-start gap-4 h-full">
                <div className="w-12 h-12 rounded-xl bg-[#8B2CF5]/20 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-[#8B2CF5]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                  <p className="text-white/50 text-sm">{item.description}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
