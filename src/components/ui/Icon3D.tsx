import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { forwardRef } from "react";

interface Icon3DProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "surface" | "brand" | "muted" | "success" | "warning" | "ocean";
  float?: boolean;
  iconClassName?: string;
}

const sizeMap = {
  sm: { container: "w-10 h-10 rounded-xl", icon: "w-5 h-5" },
  md: { container: "w-12 h-12 rounded-2xl", icon: "w-6 h-6" },
  lg: { container: "w-14 h-14 rounded-2xl", icon: "w-7 h-7" },
  xl: { container: "w-16 h-16 rounded-3xl", icon: "w-8 h-8" },
  "2xl": { container: "w-20 h-20 rounded-3xl", icon: "w-10 h-10" },
};

const variantStyles = {
  surface: "icon-3d text-foreground",
  brand: "icon-3d-brand text-white",
  muted: "icon-3d bg-muted/50 text-muted-foreground",
  success: "icon-3d-brand bg-gradient-to-br from-emerald to-primary text-white",
  warning: "icon-3d bg-gradient-to-br from-warning to-warning/80 text-white shadow-[0_8px_20px_-4px_rgba(245,158,11,0.4)]",
  ocean: "icon-3d-brand bg-gradient-to-br from-ocean to-teal text-white",
};

export const Icon3D = forwardRef<HTMLDivElement, Icon3DProps>(
  ({ icon: Icon, size = "md", variant = "surface", float = false, className, iconClassName, ...props }, ref) => {
    const sizeStyles = sizeMap[size];

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center transition-transform duration-300",
          sizeStyles.container,
          variantStyles[variant],
          float && "animate-float",
          className
        )}
        {...props}
      >
        <Icon className={cn(sizeStyles.icon, iconClassName)} strokeWidth={1.5} />
      </div>
    );
  }
);

Icon3D.displayName = "Icon3D";
