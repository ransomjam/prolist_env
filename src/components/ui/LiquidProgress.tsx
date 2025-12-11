import { cn } from "@/lib/utils";

interface LiquidProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

export function LiquidProgress({ 
  value, 
  max = 100, 
  showLabel = false,
  size = "md",
  className 
}: LiquidProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-muted-foreground">Progress</span>
          <span className="text-sm font-bold text-gradient">{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className={cn("progress-liquid", sizeMap[size])}>
        <div 
          className="progress-liquid-fill"
          style={{ width: `${percentage}%` }}
        >
          {/* Animated shimmer */}
          <div 
            className="absolute inset-0 overflow-hidden rounded-inherit"
            style={{ borderRadius: "inherit" }}
          >
            <div 
              className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
