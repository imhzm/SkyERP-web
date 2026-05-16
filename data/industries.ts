export type Industry = {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  ogImage: string;
};

export const industries: Industry[] = [
  {
    id: "retail",
    name: "التجزئة",
    description: "نظام شامل للمبيعات، الكاشير، المخازن، العملاء والفروع للمحلات والمعارض",
    icon: "/images/icons/retail.svg",
    href: "/industries/retail",
    color: "#0A6CF1",
    ogImage: "/images/og/retail-og.webp",
  },
  {
    id: "manufacturing",
    name: "المصانع",
    description: "إدارة التصنيع، الخامات، الإنتاج، الجودة، المخازن والتكاليف للمصانع",
    icon: "/images/icons/manufacturing.svg",
    href: "/industries/manufacturing",
    color: "#8B2CF5",
    ogImage: "/images/og/manufacturing-industry-og.webp",
  },
  {
    id: "services",
    name: "الخدمات",
    description: "إدارة العملاء، المشاريع، الفواتير، التذاكر والتقارير لشركات الخدمات",
    icon: "/images/icons/services.svg",
    href: "/industries/services",
    color: "#FF6636",
    ogImage: "/images/og/services-og.webp",
  },
  {
    id: "agencies",
    name: "الوكالات",
    description: "إدارة العملاء، المشاريع، الفرق، الفواتير، الحملات والتقارير",
    icon: "/images/icons/agencies.svg",
    href: "/industries/agencies",
    color: "#FF4FD8",
    ogImage: "/images/og/agencies-og.webp",
  },
  {
    id: "clinics",
    name: "العيادات",
    description: "إدارة المرضى، المواعيد، الكشوفات، الفواتير والتقارير الطبية",
    icon: "/images/icons/clinics.svg",
    href: "/industries/clinics",
    color: "#0A6CF1",
    ogImage: "/images/og/clinics-og.webp",
  },
  {
    id: "restaurants",
    name: "المطاعم",
    description: "إدارة الطلبات، المنيو، المطبخ، المخزون، الكاشير والفروع",
    icon: "/images/icons/restaurants.svg",
    href: "/industries/restaurants",
    color: "#8B2CF5",
    ogImage: "/images/og/restaurants-og.webp",
  },
  {
    id: "ecommerce",
    name: "التجارة الإلكترونية",
    description: "ربط متجرك الإلكتروني بالمخزون والحسابات والمبيعات تلقائيًا",
    icon: "/images/icons/ecommerce.svg",
    href: "/industries/ecommerce",
    color: "#FF6636",
    ogImage: "/images/og/ecommerce-og.webp",
  },
  {
    id: "distribution",
    name: "التوزيع",
    description: "إدارة الموزعين، الأسطول، المخازن، الطلبات والتسليمات",
    icon: "/images/icons/distribution.svg",
    href: "/industries/distribution",
    color: "#FF4FD8",
    ogImage: "/images/og/distribution-og.webp",
  },
  {
    id: "maintenance",
    name: "الصيانة",
    description: "إدارة طلبات الصيانة، الفنيين، قطع الغيار، المواعيد والفواتير",
    icon: "/images/icons/maintenance.svg",
    href: "/industries/maintenance",
    color: "#0A6CF1",
    ogImage: "/images/og/maintenance-og.webp",
  },
];
