"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  FileText,
  PieChart,
  Download,
} from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";

const reports = [
  { icon: DollarSign, title: "تقارير مالية", description: "قائمة دخل، ميزانية، تدفقات نقدية — تقارير جاهزة للتقديم للبنوك والجهات الرسمية" },
  { icon: TrendingUp, title: "تقارير مبيعات", description: "المبيعات حسب المنتج/الفرع/المندوب — مع تحليل ومقارنات دورية" },
  { icon: Package, title: "تقارير مخزون", description: "حركة المخزون، الجرد، الكميات الحرجة — تنبيهات تلقائية عند نقص المخزون" },
  { icon: Users, title: "تقارير HR", description: "الحضور، الإجازات، الرواتب، التقييمات — كل بيانات الموظفين في تقرير واحد" },
  { icon: FileText, title: "تقارير مشتريات", description: "الموردين، المشتريات، الأسعار — تحليل أداء الموردين وأفضل العروض" },
  { icon: PieChart, title: "BI Dashboards", description: "لوحات مؤشرات لحظية قابلة للتخصيص — اسحب وأفلت واعرض اللي يهمك" },
];

export default function ReportsSection() {
  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          title="تقارير لحظية… قرارات أسرع"
          subtitle="كل التقارير اللي تحتاجها جاهزة بنقرة — مالية، مبيعات، مخزون، HR. محدش في شركتك يحتاج Excel تاني"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="flex items-start gap-4 h-full">
                  <div className="w-12 h-12 rounded-xl bg-[#0A6CF1]/20 flex items-center justify-center shrink-0">
                    <report.icon className="w-6 h-6 text-[#0A6CF1]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{report.title}</h3>
                    <p className="text-white/50 text-sm">{report.description}</p>
                  </div>
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
                src="/images/skyerp/crm-analytics-تحليلات.webp"
                alt="Sky ERP - لوحة تحليلات وتقارير لحظية"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
