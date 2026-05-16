import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "برنامج HR ورواتب للموظفين",
  description: "إدارة الموظفين، الحضور، الإجازات، السلف، الخصومات، الرواتب والتقييمات.",
  path: "/apps/hr-payroll",
  ogImage: "/images/og/hr-payroll-og.webp",
});

export { default } from "./page.client";
