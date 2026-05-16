import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { SITE } from "@/lib/constants";
import { navigation } from "@/data/navigation";

export default function Footer() {
  const mainNav = navigation.filter((n) => !n.children);
  const appNav = navigation.find((n) => n.label === "التطبيقات");
  const industryNav = navigation.find((n) => n.label === "القطاعات");

  return (
    <footer className="border-t border-white/10 bg-[#001A3A]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Image
              src={SITE.logoWhite}
              alt={SITE.name}
              width={140}
              height={36}
              className="h-9 w-auto mb-4"
            />
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              {SITE.description}
            </p>
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <MapPin className="w-4 h-4" />
              <span>مصر</span>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">التطبيقات</h3>
            <ul className="space-y-2">
              {appNav?.children?.slice(0, 7).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/50 hover:text-[#0A6CF1] text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">القطاعات</h3>
            <ul className="space-y-2">
              {industryNav?.children?.slice(0, 6).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/50 hover:text-[#0A6CF1] text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">تواصل معنا</h3>
            <div className="space-y-3 text-sm">
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/50 hover:text-[#0A6CF1] transition-colors"
              >
                <Phone className="w-4 h-4" />
                {SITE.whatsapp}
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-2 text-white/50 hover:text-[#0A6CF1] transition-colors"
              >
                <Mail className="w-4 h-4" />
                {SITE.email}
              </a>
            </div>
            <div className="mt-6">
              <Link href="/demo">
                <Button size="sm">احجز Demo مجاني</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} {SITE.name}. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy-policy"
              className="text-white/30 hover:text-white/50 text-xs transition-colors"
            >
              سياسة الخصوصية
            </Link>
            <Link
              href="/terms"
              className="text-white/30 hover:text-white/50 text-xs transition-colors"
            >
              الشروط والأحكام
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
