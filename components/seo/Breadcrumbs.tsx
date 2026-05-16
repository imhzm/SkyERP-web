import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BreadcrumbItem } from "@/lib/seo/breadcrumbs";

export default function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("mb-6", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-white/50">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && <ChevronLeft className="w-4 h-4" />}
            {item.href && index < items.length - 1 ? (
              <Link href={item.href} className="hover:text-[#0A6CF1] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-white/80">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
