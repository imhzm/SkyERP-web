"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";

type FormData = {
  name: string;
  email: string;
  message: string;
};

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <GlassCard className="text-center p-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#8B2CF5]/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-[#8B2CF5]" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">شكرًا لرسالتك!</h3>
        <p className="text-white/60">
          تم استلام رسالتك بنجاح. فريقنا هيرد عليك في أقرب وقت.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8">
      <h3 className="text-xl font-bold text-white mb-6">أرسل لنا رسالة</h3>
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
          <label className="block text-white/70 text-sm mb-2">الرسالة</label>
          <textarea
            rows={4}
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0A6CF1] transition-colors"
            placeholder="رسالتك"
          />
        </div>
        <Button type="submit" className="w-full">إرسال</Button>
      </form>
    </GlassCard>
  );
}
