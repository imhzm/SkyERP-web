export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type SchemaBreadcrumbItem = {
  name: string;
  url: string;
};

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: "الرئيسية", href: "/" }];

  let current = "";
  for (const segment of segments) {
    current += `/${segment}`;
    const label = segmentToLabel(segment);
    items.push({ label, href: current });
  }

  return items;
}

export function breadcrumbsToSchema(items: BreadcrumbItem[]): SchemaBreadcrumbItem[] {
  return items
    .filter((item) => item.href)
    .map((item) => ({
      name: item.label,
      url: `https://erp.skywaveads.com${item.href}`,
    }));
}

function segmentToLabel(segment: string): string {
  const labels: Record<string, string> = {
    features: "المميزات",
    apps: "التطبيقات",
    accounting: "الحسابات",
    inventory: "المخزون",
    sales: "المبيعات",
    purchase: "المشتريات",
    crm: "CRM",
    pos: "نقاط البيع",
    "hr-payroll": "الموارد البشرية والرواتب",
    projects: "المشاريع",
    manufacturing: "التصنيع",
    helpdesk: "خدمة العملاء",
    "whatsapp-crm": "واتساب CRM",
    "ai-assistant": "المساعد الذكي",
    "reports-bi": "التقارير وBI",
    automation: "الأتمتة",
    marketplace: "المتجر",
    industries: "القطاعات",
    retail: "التجزئة",
    services: "الخدمات",
    agencies: "الوكالات",
    clinics: "العيادات",
    restaurants: "المطاعم",
    ecommerce: "التجارة الإلكترونية",
    distribution: "التوزيع",
    maintenance: "الصيانة",
    pricing: "الأسعار",
    implementation: "التنفيذ",
    integrations: "التكاملات",
    security: "الأمان",
    about: "عن المنصة",
    blog: "المدونة",
    demo: "عرض تجريبي",
    contact: "اتصل بنا",
    "privacy-policy": "سياسة الخصوصية",
    terms: "الشروط والأحكام",
  };

  return labels[segment] || segment;
}
