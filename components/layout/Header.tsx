"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";
import { navigation } from "@/data/navigation";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const HIDDEN_PATHS = ["/dashboard", "/admin", "/login", "/register", "/forgot-password", "/reset-password", "/onboarding", "/verify-email"];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  if (HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={SITE.logo}
              alt={SITE.name}
              width={120}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <nav aria-label="القائمة الرئيسية" className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <div
                key={item.href}
                className="relative group"
                onMouseEnter={() => setOpenDropdown(item.href)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {item.label}
                  {item.children && <ChevronDown className="w-3 h-3" />}
                </Link>
                {item.children && openDropdown === item.href && (
                  <div className="absolute top-full right-0 mt-1 w-56 glass rounded-xl p-2 shadow-2xl">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/register">
              <Button size="sm">التسجيل مجاناً</Button>
            </Link>
          </div>

          <button
            className="lg:hidden text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="القائمة"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "lg:hidden fixed inset-x-0 top-16 bottom-0 bg-[#0a0a0a] border-t border-white/10 transition-transform duration-300 z-40 overflow-y-auto",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
              {item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="block px-8 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="pt-4 px-4">
            <Link href="/register" onClick={() => setOpen(false)}>
              <Button className="w-full">التسجيل مجاناً</Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
