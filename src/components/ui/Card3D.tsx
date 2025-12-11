import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass" | "interactive" | "hero";
  float?: boolean;
}

export const Card3D = forwardRef<HTMLDivElement, Card3DProps>(
  ({ className, variant = "default", float = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative transition-all duration-400",
          variant === "default" && "card-3d",
          variant === "elevated" && "card-3d shadow-[var(--shadow-3d-elevated)]",
          variant === "glass" && "card-glass-3d",
          variant === "interactive" && "card-3d-interactive",
          variant === "hero" && "hero-3d text-white",
          float && "float-3d",
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

Card3D.displayName = "Card3D";
