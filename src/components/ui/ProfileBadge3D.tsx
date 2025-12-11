import { cn } from "@/lib/utils";
import { ShieldCheck, Crown, Star, Award } from "lucide-react";
import { LucideIcon } from "lucide-react";

type BadgeType = "verified" | "premium" | "trusted" | "seller";

interface ProfileBadge3DProps {
  type: BadgeType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const badgeConfig: Record<BadgeType, {
  gradient: string;
  icon: LucideIcon;
  label: string;
  shadow: string;
}> = {
  verified: {
    gradient: "linear-gradient(145deg, hsl(152 87% 45%), hsl(152 87% 35%))",
    icon: ShieldCheck,
    label: "Verified",
    shadow: "0 8px 20px -4px rgba(15, 191, 109, 0.5)",
  },
  premium: {
    gradient: "linear-gradient(145deg, hsl(45 93% 50%), hsl(38 92% 45%))",
    icon: Crown,
    label: "Premium",
    shadow: "0 8px 20px -4px rgba(245, 158, 11, 0.5)",
  },
  trusted: {
    gradient: "linear-gradient(145deg, hsl(200 98% 50%), hsl(200 98% 40%))",
    icon: Award,
    label: "Trusted",
    shadow: "0 8px 20px -4px rgba(2, 128, 199, 0.5)",
  },
  seller: {
    gradient: "var(--gradient-brand)",
    icon: Star,
    label: "Top Seller",
    shadow: "0 8px 20px -4px rgba(15, 191, 109, 0.4)",
  },
};

const sizeMap = {
  sm: { container: "w-8 h-8 rounded-xl", icon: "w-4 h-4" },
  md: { container: "w-10 h-10 rounded-xl", icon: "w-5 h-5" },
  lg: { container: "w-12 h-12 rounded-2xl", icon: "w-6 h-6" },
};

export function ProfileBadge3D({ type, size = "md", className }: ProfileBadge3DProps) {
  const config = badgeConfig[type];
  const sizeStyles = sizeMap[size];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        sizeStyles.container,
        className
      )}
      style={{
        background: config.gradient,
        boxShadow: `
          ${config.shadow},
          inset 0 1px 2px rgba(255, 255, 255, 0.3),
          inset 0 -1px 2px rgba(0, 0, 0, 0.1)
        `,
      }}
      title={config.label}
    >
      {/* Shine effect */}
      <div 
        className="absolute inset-0 rounded-inherit overflow-hidden"
        style={{ borderRadius: "inherit" }}
      >
        <div 
          className="absolute top-0 left-0 w-full h-1/2"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)",
          }}
        />
      </div>
      
      <Icon className={cn(sizeStyles.icon, "text-white relative z-10")} strokeWidth={2} />
    </div>
  );
}
