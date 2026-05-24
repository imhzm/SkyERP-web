"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Database,
  FileSpreadsheet,
  Package,
  Users,
  DollarSign,
  UserCheck,
  FileBarChart,
} from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";

const problems = [
  { icon: Database, text: "بيانات متفرقة" },
  { icon: FileSpreadsheet, text: "Excel كتير" },
  { icon: Package, text: "مخزون مش مضبوط" },
  { icon: Users, text: "عملاء بتضيع" },
  { icon: DollarSign, text: "حسابات متأخرة" },
  { icon: UserCheck, text: "موظفين بدون متابعة" },
  { icon: FileBarChart, text: "تقارير يدوية" },
];

export default function ProblemSection() {
  return (
    <section className="py-20 relative">
      <Container>
        <SectionHeading
          title="إدارة شركتك مش لازم تبقى فوضى"
          subtitle="7 مشاكل يومية بتضيع وقتك وفلوسك — و Sky ERP بيحلها كلها في نظام واحد متكامل"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4">
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <GlassCard className="text-center h-full">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#FF6636]/10 flex items-center justify-center">
                    <problem.icon className="w-6 h-6 text-[#FF6636]" />
                  </div>
                  <p className="text-white/70 text-sm font-medium">{problem.text}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden glass p-2"
          >
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src="/images/skyerp/automation-hero-اتمتة.webp"
                alt="Sky ERP - أتمتة وتحول رقمي للشركات"
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
