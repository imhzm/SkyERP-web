"use client";

import { motion } from "framer-motion";
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
  { icon: DollarSign, title: "تقارير مالية", description: "قائمة دخل، ميزانية، تدفقات نقدية" },
  { icon: TrendingUp, title: "تقارير مبيعات", description: "المبيعات حسب المنتج/الفرع/المندوب" },
  { icon: Package, title: "تقارير مخزون", description: "حركة المخزون، الجرد، الكميات الحرجة" },
  { icon: Users, title: "تقارير HR", description: "الحضور، الإجازات، الرواتب، التقييمات" },
  { icon: FileText, title: "تقارير مشتريات", description: "الموردين، المشتريات، الأسعار" },
  { icon: PieChart, title: "BI Dashboards", description: "لوحات مؤشرات لحظية قابلة للتخصيص" },
];

export default function ReportsSection() {
  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          title="تقارير لحظية… قرارات أسرع"
          subtitle="كل التقارير اللي تحتاجها في لوحة تحكم واحدة"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </Container>
    </section>
  );
}
