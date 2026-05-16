import { cn } from "@/lib/utils";

type BadgeVariant = "primary" | "purple" | "pink" | "orange" | "default";

export default function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        {
          "bg-[#0A6CF1]/20 text-[#0A6CF1]": variant === "primary",
          "bg-[#8B2CF5]/20 text-[#8B2CF5]": variant === "purple",
          "bg-[#FF4FD8]/20 text-[#FF4FD8]": variant === "pink",
          "bg-[#FF6636]/20 text-[#FF6636]": variant === "orange",
          "bg-white/10 text-white/70": variant === "default",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
