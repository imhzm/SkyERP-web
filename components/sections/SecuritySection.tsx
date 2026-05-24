"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { FeatureCard } from "@/components/cards";
import { Shield, Key, FileSearch, RotateCcw, Lock, Eye } from "lucide-react";

const securityFeatures = [
  { icon: Key, title: "صلاحيات متقدمة", description: "تحكم كامل بصلاحيات المستخدمين والأدوار — كل موظف يشوف اللي له بس" },
  { icon: FileSearch, title: "Audit Logs", description: "سجل كامل لكل التغييرات في النظام — مين غير إيه وإمتى" },
  { icon: RotateCcw, title: "نسخ احتياطي تلقائي", description: "نسخ احتياطي يومي وأسبوعي — بياناتك في أمان حتى لو حصل أي طارئ" },
  { icon: Shield, title: "توثيق ثنائي (2FA)", description: "حماية إضافية للحسابات الحساسة — مش بس كلمة مرور" },
  { icon: Lock, title: "عزل البيانات", description: "بيانات كل شركة معزولة تمامًا عن باقي الشركات — خصوصية تامة" },
  { icon: Eye, title: "مراقبة الجلسات", description: "مراقبة النشاط والجلسات النشطة — اعرف مين داخل النظام دلوقتي" },
];

export default function SecuritySection() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A6CF1]/5 to-transparent" />
      <Container className="relative z-10">
        <SectionHeading
          title="أمان من الدرجة الأولى"
          subtitle="بيانات شركتك خط أحمر. تشفير، صلاحيات، Audit Logs، 2FA — كل اللي تحتاجه عشان تكون مرتاح"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden glass p-2 lg:order-1"
          >
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src="/images/skyerp/erp-digital-تحول-رقمي.webp"
                alt="Sky ERP - أمن المعلومات وحماية البيانات"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            </div>
          </motion.div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
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
        </div>
      </Container>
    </section>
  );
}
