"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { SITE } from "@/lib/constants";

export default function HeroCommandCenter() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A6CF1]/10 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0A6CF1]/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8B2CF5]/20 rounded-full blur-[120px]" />

      <Container className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 text-sm text-white/60">
            <Sparkles className="w-4 h-4 text-[#0A6CF1]" />
            منصة ERP عربية ذكية للشركات
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            {SITE.name}
            <br />
            <span className="gradient-text">كل إدارتك في نظام واحد</span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-10 leading-relaxed">
            Sky ERP هو نظام ERP سحابي عربي متكامل — محاسبة، مبيعات، مشتريات، مخزون، HR، CRM، نقاط بيع، ذكاء اصطناعي، وتقارير لحظية. كل إدارات شركتك في نظام واحد ومنصة واحدة
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-base gap-2">
                التسجيل مجاناً
              </Button>
            </Link>
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="secondary"
                size="lg"
                className="text-base gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                تواصل واتساب
              </Button>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-16 relative"
        >
          <div className="glass rounded-2xl p-2 max-w-5xl mx-auto">
            <div className="aspect-video rounded-xl overflow-hidden relative bg-gradient-to-br from-[#001A3A] to-[#0A6CF1]/20">
              <Image
                src="/images/skyerp/erp-dashboard-ادارة-الشركات.webp"
                alt="Sky ERP Dashboard - لوحة تحكم متكاملة لإدارة الشركات"
                fill
                className="object-cover object-top"
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
