import { createMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, softwareSchema } from "@/lib/seo/schema";
import { getBreadcrumbs } from "@/lib/seo/breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import Container from "@/components/ui/Container";
import { Download, Monitor, Zap, Shield, Cloud, RefreshCw } from "lucide-react";

const VERSION_JSON_URL = "https://downloads.skywaveads.com/erp/version.json";

async function getLatestVersion() {
  try {
    const res = await fetch(VERSION_JSON_URL, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error("Failed to fetch");
    return await res.json();
  } catch {
    return null;
  }
}

export const metadata = createMetadata({
  title: "تحميل برنامج Sky ERP",
  description: "حمّل برنامج Sky ERP لإدارة شركتك. دعم المبيعات، الحسابات، المخزون، والموظفين. يدعم Windows 10/11، يعمل online/offline.",
  path: "/download",
  ogImage: "/images/og/download-og.webp",
});

const features = [
  { icon: Monitor, title: "سطح مكتب", desc: "تطبيق Windows أصلي — خفيف وسريع" },
  { icon: Cloud, title: "متصل بالسحابة", desc: "مزامنة تلقائية مع MongoDB Atlas" },
  { icon: Zap, title: "يعمل بدون نت", desc: "SQLite محلي — شغّل حتى بدون إنترنت" },
  { icon: Shield, title: "تحديثات تلقائية", desc: "آخر الإصدارات والتحسينات تصل إليك مباشرة" },
];

export default async function DownloadPage() {
  const breadcrumbs = getBreadcrumbs("/download");
  const data = await getLatestVersion();
  const version = data?.version ?? "2.3.15";
  const downloadUrl = data?.url ?? "https://downloads.skywaveads.com/erp/latest";
  const fallbackUrl = "https://downloads.skywaveads.com/erp/latest";
  const checksumUrl = VERSION_JSON_URL;
  return (
    <>
      <JsonLd data={softwareSchema()} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <div className="pt-28 pb-20">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <div className="text-center max-w-3xl mx-auto mt-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#0A6CF1]/20 to-[#8B2CF5]/20 flex items-center justify-center">
              <Download className="w-10 h-10 text-[#0A6CF1]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              برنامج Sky ERP
            </h1>
            <p className="text-lg text-white/50 mb-2">
              الإصدار {version}
            </p>
            <a
              href={downloadUrl}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#0A6CF1] to-[#8B2CF5] text-white rounded-2xl px-10 py-5 text-xl font-bold hover:shadow-[0_0_40px_rgba(10,108,241,0.5)] hover:scale-105 transition-all duration-300 mt-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="w-6 h-6" />
              تحميل البرنامج
            </a>
            <p className="text-white/30 text-sm mt-3">
              متوافق مع Windows 10 و 11 — 64-bit
            </p>
            <p className="text-white/20 text-xs mt-2">
              <a href={fallbackUrl} className="hover:text-white/40 transition-colors" target="_blank" rel="noopener noreferrer">
                رابط بديل (تحميل مباشر من السيرفر)
              </a>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-16">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0A6CF1]/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-[#0A6CF1]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{f.title}</h3>
                <p className="text-white/50 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mt-16 bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <RefreshCw className="w-6 h-6 text-[#0A6CF1] mt-1 shrink-0" />
              <div>
                <h2 className="text-white font-bold text-xl mb-3">التحديث التلقائي</h2>
                <p className="text-white/50 text-sm leading-relaxed mb-4">
                  بعد تثبيت البرنامج، سيتحقق تلقائياً من وجود إصدار أحدث عند كل تشغيل. يمكنك
                  أيضاً التحقق يدوياً من قسم "التحديثات" داخل البرنامج.
                </p>
                <p className="text-white/50 text-sm">
                  رابط التحقق من التحديثات:{" "}
                  <code className="text-[#0A6CF1] bg-white/5 px-2 py-1 rounded text-xs">
                    {checksumUrl}
                  </code>
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-8 bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-green-400 mt-1 shrink-0" />
              <div>
                <h2 className="text-white font-bold text-xl mb-3">التحقق من التحميل</h2>
                <p className="text-white/50 text-sm leading-relaxed">
                  يمكنك التحقق من سلامة الملف عبر مقارنة SHA-256 الموجود في{" "}
                  <code className="text-[#0A6CF1] bg-white/5 px-2 py-1 rounded text-xs">
                    version.json
                  </code>{" "}
                  مع الملف الذي قمت بتحميله.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
