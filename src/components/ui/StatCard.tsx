import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon?: LucideIcon;
  value: number | string;
  label: string;
  variant?: "default" | "ocean" | "teal" | "primary" | "warning";
  className?: string;
}

const variantStyles = {
  default: {
    value: "text-foreground",
  },
  ocean: {
    value: "text-ocean",
  },
  teal: {
    value: "text-teal",
  },
  primary: {
    value: "text-primary",
  },
  warning: {
    value: "text-warning",
  },
};

export function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  variant = "default",
  className 
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div 
      className={cn(
        "bg-card border border-border/60 rounded-lg p-4 text-center",
        className
      )}
    >
      {Icon && (
        <div className="flex justify-center mb-2">
          <Icon className={cn("w-5 h-5", styles.value)} />
        </div>
      )}
      <p className={cn("text-2xl font-bold tracking-tight", styles.value)}>
        {value}
      </p>
      <p className="text-xs font-medium text-muted-foreground mt-1">
        {label}
      </p>
    </div>
  );
}
