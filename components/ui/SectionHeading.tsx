import { cn } from "@/lib/utils";

export default function SectionHeading({
  title,
  subtitle,
  gradient = false,
  className,
  align = "center",
}: {
  title: string;
  subtitle?: string;
  gradient?: boolean;
  className?: string;
  align?: "center" | "right" | "left";
}) {
  return (
    <div
      className={cn(
        "max-w-3xl mb-12",
        align === "center" && "mx-auto text-center",
        align === "right" && "text-right",
        align === "left" && "text-left",
        className
      )}
    >
      {gradient ? (
        <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-4">
          {title}
        </h2>
      ) : (
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-lg text-white/60 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
