export type PricingPlan = {
  name: string;
  description: string;
  price: string;
  currency: string;
  period: string;
  features: string[];
  highlighted: boolean;
  cta: string;
};

export const pricingPlans: PricingPlan[] = [
  {
    name: "انطلاق",
    description: "للشركات الصغيرة وريادة الأعمال",
    price: "299",
    currency: "ج.م",
    period: "شهريًا",
    features: [
      "حتى 3 مستخدمين",
      "موديول واحد",
      "دعم فني عبر البريد",
      "تحديثات دورية",
      "نسخ احتياطي أسبوعي",
    ],
    highlighted: false,
    cta: "ابدأ الآن",
  },
  {
    name: "نمو",
    description: "للشركات المتوسطة",
    price: "799",
    currency: "ج.م",
    period: "شهريًا",
    features: [
      "حتى 10 مستخدمين",
      "جميع الموديولات",
      "دعم فني عبر البريد والواتساب",
      "تحديثات دورية",
      "نسخ احتياطي يومي",
      "تقارير متقدمة",
    ],
    highlighted: true,
    cta: "اختر الباقة",
  },
  {
    name: "مؤسسة",
    description: "للشركات الكبيرة والفروع المتعددة",
    price: "1,999",
    currency: "ج.م",
    period: "شهريًا",
    features: [
      "عدد غير محدود من المستخدمين",
      "جميع الموديولات",
      "دعم فني متميز 24/7",
      "مدير حساب مخصص",
      "تخصيص وإعدادات متقدمة",
      "نسخ احتياطي لحظي",
      "تقارير BI متقدمة",
      "Multi-branch",
    ],
    highlighted: false,
    cta: "تواصل معنا",
  },
];
