import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 cursor-pointer",
          {
            "bg-gradient-to-r from-[#0A6CF1] to-[#8B2CF5] text-white hover:shadow-[0_0_30px_rgba(10,108,241,0.4)] hover:scale-105":
              variant === "primary",
            "bg-white/10 text-white border border-white/20 hover:bg-white/20":
              variant === "secondary",
            "border border-[#0A6CF1] text-[#0A6CF1] hover:bg-[#0A6CF1]/10":
              variant === "outline",
            "text-white/70 hover:text-white hover:bg-white/10":
              variant === "ghost",
          },
          {
            "px-4 py-2 text-sm": size === "sm",
            "px-6 py-3 text-base": size === "md",
            "px-8 py-4 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
