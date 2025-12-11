import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "premium" | "interactive" | "hero";
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-[32px] p-6 transition-all duration-400",
          variant === "default" && "card-3d",
          variant === "elevated" && "card-3d shadow-[var(--shadow-3d-elevated)]",
          variant === "premium" && "card-glass-3d",
          variant === "interactive" && "card-3d-interactive",
          variant === "hero" && "hero-3d text-white",
          className
        )}
        {...props}
      >
        {variant === "hero" && (
          <div className="absolute inset-0 overflow-hidden rounded-[32px]">
            <div className="absolute -top-1/2 -right-1/2 w-full h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_50%)] animate-[subtle-rotate_20s_linear_infinite]" />
          </div>
        )}
        <div className={cn(variant === "hero" && "relative z-10")}>
          {children}
        </div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
