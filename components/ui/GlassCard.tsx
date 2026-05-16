import { cn } from "@/lib/utils";

export default function GlassCard({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6 transition-all duration-300",
        hover && "hover:shadow-[0_0_30px_rgba(10,108,241,0.15)] hover:border-[#0A6CF1]/30",
        className
      )}
    >
      {children}
    </div>
  );
}
