export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

export const navigation: NavItem[] = [
  { label: "الرئيسية", href: "/" },
  {
    label: "التطبيقات",
    href: "/apps",
    children: [
      { label: "الحسابات", href: "/apps/accounting" },
      { label: "المخزون", href: "/apps/inventory" },
      { label: "المبيعات", href: "/apps/sales" },
      { label: "المشتريات", href: "/apps/purchase" },
      { label: "CRM", href: "/apps/crm" },
      { label: "نقاط البيع", href: "/apps/pos" },
      { label: "الموارد البشرية", href: "/apps/hr-payroll" },
      { label: "المشاريع", href: "/apps/projects" },
      { label: "التصنيع", href: "/apps/manufacturing" },
      { label: "خدمة العملاء", href: "/apps/helpdesk" },
      { label: "واتساب CRM", href: "/apps/whatsapp-crm" },
      { label: "المساعد الذكي", href: "/apps/ai-assistant" },
      { label: "التقارير", href: "/apps/reports-bi" },
      { label: "الأتمتة", href: "/apps/automation" },
      { label: "المتجر", href: "/apps/marketplace" },
    ],
  },
  {
    label: "القطاعات",
    href: "/industries",
    children: [
      { label: "التجزئة", href: "/industries/retail" },
      { label: "المصانع", href: "/industries/manufacturing" },
      { label: "الخدمات", href: "/industries/services" },
      { label: "الوكالات", href: "/industries/agencies" },
      { label: "العيادات", href: "/industries/clinics" },
      { label: "المطاعم", href: "/industries/restaurants" },
      { label: "التجارة الإلكترونية", href: "/industries/ecommerce" },
      { label: "التوزيع", href: "/industries/distribution" },
      { label: "الصيانة", href: "/industries/maintenance" },
    ],
  },
  { label: "المميزات", href: "/features" },
  { label: "الأسعار", href: "/pricing" },
  { label: "المدونة", href: "/blog" },
  { label: "اتصل بنا", href: "/contact" },
];
