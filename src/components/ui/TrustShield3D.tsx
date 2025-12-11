import { cn } from "@/lib/utils";
import { Shield, ShieldCheck, Lock } from "lucide-react";

interface TrustShield3DProps {
  variant?: "default" | "verified" | "secure";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
}

const sizeMap = {
  sm: { container: "w-12 h-12", icon: "w-6 h-6" },
  md: { container: "w-16 h-16", icon: "w-8 h-8" },
  lg: { container: "w-20 h-20", icon: "w-10 h-10" },
  xl: { container: "w-28 h-28", icon: "w-14 h-14" },
};

export function TrustShield3D({ 
  variant = "default", 
  size = "md",
  className,
  animate = true 
}: TrustShield3DProps) {
  const sizeStyles = sizeMap[size];
  const Icon = variant === "verified" ? ShieldCheck : variant === "secure" ? Lock : Shield;

  return (
    <div className={cn("relative", animate && "float-3d", className)}>
      {/* Outer glow ring */}
      <div 
        className={cn(
          "absolute inset-0 rounded-3xl opacity-30 blur-xl",
          sizeStyles.container
        )}
        style={{
          background: "var(--gradient-brand)",
          transform: "scale(1.3)",
        }}
      />
      
      {/* Main 3D container */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-3xl",
          sizeStyles.container
        )}
        style={{
          background: "var(--gradient-brand)",
          boxShadow: `
            0 20px 40px -10px rgba(15, 191, 109, 0.4),
            0 10px 20px -5px rgba(2, 128, 199, 0.3),
            inset 0 2px 4px rgba(255, 255, 255, 0.3),
            inset 0 -2px 4px rgba(0, 0, 0, 0.1)
          `,
        }}
      >
        {/* Inner highlight */}
        <div 
          className="absolute inset-[3px] rounded-[20px] pointer-events-none"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.2) 0%, transparent 50%)",
          }}
        />
        
        {/* Icon */}
        <Icon 
          className={cn(sizeStyles.icon, "text-white relative z-10")} 
          strokeWidth={1.5} 
        />
      </div>
      
      {/* Reflection */}
      <div 
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 rounded-full opacity-20 blur-sm"
        style={{ background: "var(--gradient-brand)" }}
      />
    </div>
  );
}
