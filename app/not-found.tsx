import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <Container className="text-center">
        <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-[#0A6CF1]/20 to-[#8B2CF5]/20 flex items-center justify-center">
          <span className="text-5xl font-bold gradient-text">404</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
          الصفحة مش موجودة
        </h1>

        <p className="text-lg text-white/50 mb-8 max-w-md mx-auto leading-relaxed">
          يبدو إنك ضعت في مسار مش موجود. خلينا نرجّعك للمسار الصح.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button size="lg" className="gap-2">
              <Home className="w-5 h-5" />
              الرجوع للرئيسية
            </Button>
          </Link>
          <Link href="/apps">
            <Button variant="secondary" size="lg" className="gap-2">
              <ArrowLeft className="w-5 h-5" />
              استعرض التطبيقات
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
