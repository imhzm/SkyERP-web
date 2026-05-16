"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { SITE } from "@/lib/constants";

type FormData = {
  name: string;
  email: string;
  phone: string;
  company: string;
};

export default function DemoForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto glass rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#0A6CF1]/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-[#0A6CF1]" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">شكرًا لتواصلك! 🎉</h3>
        <p className="text-white/60 mb-2">
          تم استلام طلبك بنجاح. فريقنا هيتواصل معك في أقرب وقت لحجز الـ Demo.
        </p>
        <p className="text-white/40 text-sm">
          أو تواصل معنا مباشرة على واتساب: {SITE.whatsapp}
        </p>
        <div className="mt-6">
          <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">تواصل واتساب</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto glass rounded-2xl p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/70 text-sm mb-2">الاسم</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0A6CF1] transition-colors"
            placeholder="الاسم كامل"
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-2">البريد الإلكتروني</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0A6CF1] transition-colors"
            placeholder="example@domain.com"
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-2">رقم الهاتف</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0A6CF1] transition-colors"
            placeholder="+20xxxxxxxxx"
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-2">الشركة</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0A6CF1] transition-colors"
            placeholder="اسم الشركة"
          />
        </div>
        <Button type="submit" className="w-full">احجز Demo مجاني</Button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-white/30 text-sm mb-2">أو تواصل معنا مباشرة</p>
        <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" className="gap-2">واتساب</Button>
        </a>
      </div>
    </div>
  );
}
