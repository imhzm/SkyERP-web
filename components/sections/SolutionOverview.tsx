"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  LineChart,
  Box,
  ShoppingCart,
  Users,
  UserCheck,
  Store,
  FileText,
  Brain,
} from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

const modules = [
  { icon: LineChart, label: "Accounting", color: "#0A6CF1" },
  { icon: Box, label: "Inventory", color: "#8B2CF5" },
  { icon: ShoppingCart, label: "Sales", color: "#FF6636" },
  { icon: Users, label: "CRM", color: "#FF4FD8" },
  { icon: UserCheck, label: "HR", color: "#0A6CF1" },
  { icon: Store, label: "POS", color: "#8B2CF5" },
  { icon: FileText, label: "Reports", color: "#FF6636" },
  { icon: Brain, label: "AI", color: "#FF4FD8" },
];

export default function SolutionOverview() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A6CF1]/5 to-transparent" />
      <Container className="relative z-10">
        <SectionHeading
          title="Sky ERP يجمع كل أقسام شركتك في نظام واحد"
          subtitle="Core مركزي و 15+ موديول حوله — محاسبة، مبيعات، مخزون، HR، CRM، وكل حاجة بتتكامل مع بعضها في الوقت الفعلي"
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="relative max-w-3xl mx-auto">
              <div className="relative w-48 h-48 mx-auto mb-12 rounded-full glass flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold gradient-text">Sky ERP</div>
                  <div className="text-white/40 text-xs mt-1">Core</div>
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-[#0A6CF1]/20 animate-pulse" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {modules.map((mod, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform cursor-default"
                  >
                    <div
                      className="w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${mod.color}20` }}
                    >
                      <mod.icon className="w-5 h-5" style={{ color: mod.color }} />
                    </div>
                    <div className="text-white/80 text-sm font-medium">
                      {mod.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 relative rounded-2xl overflow-hidden glass p-2"
          >
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src="/images/skyerp/crm-platform-نمو-اعمال.webp"
                alt="Sky ERP - منصة متكاملة لإدارة الشركات"
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
