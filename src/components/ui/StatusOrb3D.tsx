import { cn } from "@/lib/utils";
import { Check, Clock, Package, Truck, AlertCircle } from "lucide-react";
import { LucideIcon } from "lucide-react";

type StatusType = "pending" | "active" | "transit" | "success" | "warning";

interface StatusOrb3DProps {
  status: StatusType;
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<StatusType, { 
  gradient: string; 
  shadow: string; 
  icon: LucideIcon;
  label: string;
}> = {
  pending: {
    gradient: "linear-gradient(145deg, hsl(220 15% 55%), hsl(220 15% 42%))",
    shadow: "0 6px 16px -4px rgba(100, 110, 120, 0.4)",
    icon: Clock,
    label: "Pending",
  },
  active: {
    gradient: "linear-gradient(145deg, hsl(200 90% 52%), hsl(200 90% 40%))",
    shadow: "0 6px 16px -4px rgba(2, 128, 199, 0.5)",
    icon: Package,
    label: "Active",
  },
  transit: {
    gradient: "linear-gradient(145deg, hsl(168 90% 48%), hsl(168 90% 38%))",
    shadow: "0 6px 16px -4px rgba(20, 184, 166, 0.5)",
    icon: Truck,
    label: "In Transit",
  },
  success: {
    gradient: "linear-gradient(145deg, hsl(152 85% 45%), hsl(152 85% 35%))",
    shadow: "0 6px 16px -4px rgba(15, 191, 109, 0.5)",
    icon: Check,
    label: "Complete",
  },
  warning: {
    gradient: "linear-gradient(145deg, hsl(38 92% 55%), hsl(38 92% 45%))",
    shadow: "0 6px 16px -4px rgba(245, 158, 11, 0.5)",
    icon: AlertCircle,
    label: "Warning",
  },
};

const sizeMap = {
  sm: { container: "w-8 h-8", icon: "w-4 h-4" },
  md: { container: "w-10 h-10", icon: "w-5 h-5" },
  lg: { container: "w-12 h-12", icon: "w-6 h-6" },
};

export function StatusOrb3D({ 
  status, 
  size = "md", 
  className,
  showIcon = true 
}: StatusOrb3DProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeMap[size];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative rounded-full flex items-center justify-center",
        sizeStyles.container,
        className
      )}
      style={{
        background: config.gradient,
        boxShadow: `
          ${config.shadow},
          inset 0 2px 4px rgba(255, 255, 255, 0.3),
          inset 0 -2px 4px rgba(0, 0, 0, 0.15)
        `,
      }}
    >
      {/* Top highlight */}
      <div 
        className="absolute top-[2px] left-1/2 -translate-x-1/2 w-3/5 h-1/4 rounded-full"
        style={{
          background: "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)",
        }}
      />
      
      {showIcon && (
        <Icon className={cn(sizeStyles.icon, "text-white relative z-10")} strokeWidth={2.5} />
      )}
    </div>
  );
}
