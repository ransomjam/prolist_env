import { cn } from "@/lib/utils";
import { 
  Smartphone, 
  Shirt, 
  Home, 
  Car, 
  Wrench, 
  Package,
  LucideIcon
} from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  electronics: Smartphone,
  fashion: Shirt,
  home: Home,
  vehicles: Car,
  services: Wrench,
  other: Package,
};

interface CategoryIconProps {
  categoryId: string;
  size?: "sm" | "md" | "lg";
  showBg?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const bgSizeClasses = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-11 h-11",
};

export function CategoryIcon({ 
  categoryId, 
  size = "md",
  showBg = true,
  className 
}: CategoryIconProps) {
  const Icon = categoryIcons[categoryId] || Package;

  if (!showBg) {
    return <Icon className={cn(sizeClasses[size], "text-primary", className)} strokeWidth={2} />;
  }

  return (
    <div 
      className={cn(
        "rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center",
        bgSizeClasses[size],
        className
      )}
    >
      <Icon className={cn(sizeClasses[size], "text-primary")} strokeWidth={2} />
    </div>
  );
}
