"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { IndustryCard } from "@/components/cards";
import { industries } from "@/data/industries";

export default function IndustryGrid() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#8B2CF5]/5 to-transparent" />
      <Container className="relative z-10">
        <SectionHeading
          title="حلول لكل القطاعات"
          subtitle="Sky ERP مقدركش على نشاط شركتك"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.slice(0, 6).map((ind, index) => (
            <motion.div
              key={ind.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <IndustryCard
                title={ind.name}
                description={ind.description}
                href={ind.href}
              />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/industries"
            className="text-[#0A6CF1] hover:text-[#8B2CF5] transition-colors text-sm"
          >
            استعرض كل القطاعات ←
          </Link>
        </div>
      </Container>
    </section>
  );
}
