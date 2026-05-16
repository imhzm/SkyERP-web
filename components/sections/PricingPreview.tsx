"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { PricingCard } from "@/components/cards";
import { pricingPlans } from "@/data/pricing";

export default function PricingPreview() {
  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          title="باقات تناسب كل الشركات"
          subtitle="اختار الباقة المناسبة لمرحلة شركتك"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <PricingCard {...plan} />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/pricing"
            className="text-[#0A6CF1] hover:text-[#8B2CF5] transition-colors text-sm"
          >
            شوف كل الباقات والتفاصيل ←
          </Link>
        </div>
      </Container>
    </section>
  );
}
