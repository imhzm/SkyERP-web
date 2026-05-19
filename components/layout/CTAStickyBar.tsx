"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function CTAStickyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 p-3 flex items-center gap-3 transition-transform duration-300 lg:hidden",
          visible ? "translate-y-0" : "translate-y-full"
        )}
      >
        <a
          href={`https://wa.me/${SITE.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button
            variant="secondary"
            size="sm"
            className="w-full gap-2 border-[#FF6636] text-[#FF6636]"
          >
            <MessageCircle className="w-4 h-4" />
            واتساب
          </Button>
        </a>
        <Link href="/register" className="flex-1">
          <Button size="sm" className="w-full">
            التسجيل مجاناً
          </Button>
        </Link>
      </div>
    </>
  );
}
