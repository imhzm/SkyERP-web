export type Industry = {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  ogImage: string;
  image?: string;
};

export const industries: Industry[] = [
  {
    id: "retail",
    name: "التجزئة",
    description: "حل متكامل للمحلات والمعارض — إدارة المبيعات، الكاشير، المخازن، العملاء والفروع في نظام واحد",
    icon: "/images/icons/retail.svg",
    href: "/industries/retail",
    color: "#0A6CF1",
    ogImage: "/images/og/retail-og.webp",
    image: "/images/skyerp/erp-cloud-pos-فروع.webp",
  },
  {
    id: "manufacturing",
    name: "المصانع",
    description: "أتمتة المصانع بالكامل — أوامر تصنيع، BOM، الخامات، الإنتاج، مراقبة الجودة، وحساب تكلفة الإنتاج الفعلية",
    icon: "/images/icons/manufacturing.svg",
    href: "/industries/manufacturing",
    color: "#8B2CF5",
    ogImage: "/images/og/manufacturing-industry-og.webp",
    image: "/images/skyerp/erp-automation-تشغيل-الي.webp",
  },
  {
    id: "services",
    name: "الخدمات",
    description: "منصة متكاملة لشركات الخدمات — إدارة العملاء، المشاريع، تذاكر الدعم، الفواتير المتكررة، وتقارير الأداء",
    icon: "/images/icons/services.svg",
    href: "/industries/services",
    color: "#FF6636",
    ogImage: "/images/og/services-og.webp",
    image: "/images/skyerp/erp-platform-ادارة-الاعمال.webp",
  },
  {
    id: "agencies",
    name: "الوكالات الإعلانية",
    description: "حل متكامل للوكالات — إدارة العملاء، الفرق، المشاريع، الفواتير، الحملات الإعلانية وتقارير الأداء",
    icon: "/images/icons/agencies.svg",
    href: "/industries/agencies",
    color: "#FF4FD8",
    ogImage: "/images/og/agencies-og.webp",
    image: "/images/skyerp/erp-business-محاسبة-مبيعات-crm.webp",
  },
  {
    id: "clinics",
    name: "العيادات والمراكز الطبية",
    description: "إدارة المرضى، المواعيد، الكشوفات، الفواتير الطبية، والتقارير — مع تذكير تلقائي بالمواعيد",
    icon: "/images/icons/clinics.svg",
    href: "/industries/clinics",
    color: "#0A6CF1",
    ogImage: "/images/og/clinics-og.webp",
    image: "/images/skyerp/erp-digital-تحول-رقمي.webp",
  },
  {
    id: "restaurants",
    name: "المطاعم والكافيهات",
    description: "إدارة الطلبات، المنيو الرقمي، المطبخ، المخزون، الكاشير — مع ربط مباشر بين الفروع والمخزون المركزي",
    icon: "/images/icons/restaurants.svg",
    href: "/industries/restaurants",
    color: "#8B2CF5",
    ogImage: "/images/og/restaurants-og.webp",
    image: "/images/skyerp/erp-cloud-pos-فروع.webp",
  },
  {
    id: "ecommerce",
    name: "التجارة الإلكترونية",
    description: "اربط متجرك الإلكتروني (Shopify، WooCommerce، غيره) بالمخزون والحسابات والمبيعات — مزامنة لحظية",
    icon: "/images/icons/ecommerce.svg",
    href: "/industries/ecommerce",
    color: "#FF6636",
    ogImage: "/images/og/ecommerce-og.webp",
    image: "/images/skyerp/erp-platform-ادارة-الاعمال.webp",
  },
  {
    id: "distribution",
    name: "التوزيع واللوجستيك",
    description: "إدارة الموزعين، الأسطول، المخازن، الطلبات والتسليمات — مع تتبع الشحنات وجدولة التوزيع",
    icon: "/images/icons/distribution.svg",
    href: "/industries/distribution",
    color: "#FF4FD8",
    ogImage: "/images/og/distribution-og.webp",
    image: "/images/skyerp/erp-smart-dashboard-ادارة-ذكية.webp",
  },
  {
    id: "maintenance",
    name: "الصيانة وخدمات ما بعد البيع",
    description: "إدارة طلبات الصيانة، الفنيين، قطع الغيار، جدولة المواعيد — مع تتبع حالة كل طلب وفواتير الصيانة",
    icon: "/images/icons/maintenance.svg",
    href: "/industries/maintenance",
    color: "#0A6CF1",
    ogImage: "/images/og/maintenance-og.webp",
    image: "/images/skyerp/erp-unified-ادارة-الاقسام.webp",
  },
];
