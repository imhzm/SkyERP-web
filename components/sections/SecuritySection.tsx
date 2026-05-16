"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { FeatureCard } from "@/components/cards";
import { Shield, Key, FileSearch, RotateCcw, Lock, Eye } from "lucide-react";

const securityFeatures = [
  { icon: Key, title: "صلاحيات", description: "تحكم كامل بصلاحيات المستخدمين والأدوار" },
  { icon: FileSearch, title: "Audit Logs", description: "سجل كامل لكل التغييرات في النظام" },
  { icon: RotateCcw, title: "نسخ احتياطي", description: "نسخ احتياطي تلقائي يومي وأسبوعي" },
  { icon: Shield, title: "2FA", description: "توثيق ثنائي لحماية الحسابات" },
  { icon: Lock, title: "عزل البيانات", description: "بيانات كل شركة معزولة تمامًا" },
  { icon: Eye, title: "مراقبة", description: "مراقبة النشاط والجلسات النشطة" },
];

export default function SecuritySection() {
  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          title="أمان من الدرجة الأولى"
          subtitle="بيانات شركتك في أمان مع Sky ERP"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <FeatureCard
                icon={<feature.icon className="w-6 h-6 text-[#0A6CF1]" />}
                title={feature.title}
                description={feature.description}
              />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
