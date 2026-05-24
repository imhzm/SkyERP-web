import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";

interface CardProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
  color?: string;
  gradient?: boolean;
  image?: string;
}

export function ModuleCard({ title, description, href, icon, color = "#0A6CF1", image }: CardProps) {
  return (
    <Link href={href}>
      <GlassCard className="group h-full cursor-pointer overflow-hidden">
        {image && (
          <div className="relative w-full h-32 -mx-4 -mt-4 mb-3 overflow-hidden" style={{ width: "calc(100% + 2rem)" }}>
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          </div>
        )}
        <div className="flex items-start gap-4">
          {icon && (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${color}15` }}
            >
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold mb-1 group-hover:text-[#0A6CF1] transition-colors">
              {title}
            </h3>
            <p className="text-white/50 text-sm leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}

export function IndustryCard({ title, description, href, image }: CardProps) {
  return (
    <Link href={href}>
      <GlassCard className="group h-full cursor-pointer text-center overflow-hidden">
        {image && (
          <div className="relative w-full h-28 -mx-4 -mt-4 mb-3 overflow-hidden" style={{ width: "calc(100% + 2rem)" }}>
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          </div>
        )}
        <h3 className="text-white font-semibold mb-2 group-hover:text-[#0A6CF1] transition-colors">
          {title}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed line-clamp-2">
          {description}
        </p>
      </GlassCard>
    </Link>
  );
}

export function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <GlassCard className="h-full">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-white/50 text-sm leading-relaxed">{description}</p>
      )}
    </GlassCard>
  );
}

export function StatCard({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("text-center", className)}>
      <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
        {value}
      </div>
      <div className="text-white/50 text-sm">{label}</div>
    </div>
  );
}

export function PricingCard({
  name,
  description,
  price,
  period,
  features,
  highlighted,
  cta,
  currency,
}: {
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  highlighted: boolean;
  cta: string;
  currency: string;
}) {
  return (
    <GlassCard
      className={cn(
        "relative flex flex-col",
        highlighted && "border-[#0A6CF1]/50 shadow-[0_0_40px_rgba(10,108,241,0.15)]"
      )}
      hover={false}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0A6CF1] to-[#8B2CF5] text-white text-xs font-medium px-4 py-1 rounded-full">
          الأكثر طلبًا
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
        <p className="text-white/50 text-sm">{description}</p>
      </div>
      <div className="mb-6">
        <span className="text-4xl font-bold text-white">{price}</span>
        <span className="text-white/50 text-sm mr-1">{currency}</span>
        <span className="text-white/30 text-sm mr-1">/ {period}</span>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="text-white/60 text-sm flex items-start gap-2">
            <span className="text-[#0A6CF1] mt-0.5">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Link href={highlighted ? "/register" : "/contact"}>
        <Button
          variant={highlighted ? "primary" : "outline"}
          className="w-full"
        >
          {cta}
        </Button>
      </Link>
    </GlassCard>
  );
}
