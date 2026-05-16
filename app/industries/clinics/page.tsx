import { createMetadata } from "@/lib/seo/metadata";
import IndustryDetail from "../details.client";

export const metadata = createMetadata({
  title: "ERP للعيادات",
  description: "إدارة المرضى، المواعيد، الكشوفات، الفواتير والتقارير الطبية.",
  path: "/industries/clinics",
  ogImage: "/images/og/clinics-og.webp",
});

export default function ClinicsPage() {
  return <IndustryDetail id="clinics" />;
}
