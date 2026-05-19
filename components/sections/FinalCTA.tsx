"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function FinalCTA() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A6CF1]/10 to-[#8B2CF5]/10" />
      <Container className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            جاهز تشغل شركتك بنظام؟
          </h2>
          <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
            سجل مجاناً وابدأ إدارة شركتك مع Sky ERP في دقائق
          </p>
          <Link href="/register">
            <Button size="lg" className="text-base">
              التسجيل مجاناً
            </Button>
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
