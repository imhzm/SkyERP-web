"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { ModuleCard } from "@/components/cards";
import { modules } from "@/data/modules";

export default function ModuleGrid() {
  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          title="موديولات Sky ERP"
          subtitle="كل تطبيق مصمم لحل مشكلة معينة في شركتك - وكلها متكاملة مع بعض."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod, index) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <ModuleCard
                title={mod.name}
                description={mod.description}
                href={mod.href}
                color={mod.color}
              />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/apps"
            className="text-[#0A6CF1] hover:text-[#8B2CF5] transition-colors text-sm"
          >
            استعرض كل التطبيقات ←
          </Link>
        </div>
      </Container>
    </section>
  );
}
