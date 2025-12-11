import { cn } from "@/lib/utils";
import { User, CheckCircle } from "lucide-react";

interface PremiumAvatarProps {
  name?: string;
  imageUrl?: string;
  isVerified?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-20 h-20",
  xl: "w-28 h-28",
};

const iconSizes = {
  sm: "w-5 h-5",
  md: "w-7 h-7",
  lg: "w-10 h-10",
  xl: "w-14 h-14",
};

const badgeSizes = {
  sm: "w-4 h-4 -right-0.5 -bottom-0.5",
  md: "w-5 h-5 -right-0.5 -bottom-0.5",
  lg: "w-6 h-6 -right-1 -bottom-1",
  xl: "w-8 h-8 -right-1 -bottom-1",
};

export function PremiumAvatar({ 
  name, 
  imageUrl, 
  isVerified = false, 
  size = "md",
  className 
}: PremiumAvatarProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Glow ring for verified users */}
      {isVerified && (
        <>
          <div 
            className={cn(
              "absolute inset-[-4px] rounded-full bg-gradient-to-r from-ocean via-teal to-primary animate-pulse-soft",
              size === "xl" && "inset-[-6px]"
            )}
          />
          <div 
            className={cn(
              "absolute inset-[-8px] rounded-full bg-gradient-to-r from-ocean via-teal to-primary opacity-30 blur-md",
              size === "xl" && "inset-[-12px] blur-lg"
            )}
          />
        </>
      )}
      
      {/* Avatar container */}
      <div 
        className={cn(
          "relative rounded-full bg-gradient-to-br from-ocean via-teal to-primary flex items-center justify-center overflow-hidden",
          sizeClasses[size],
          isVerified && "ring-2 ring-card"
        )}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name || "User"} 
            className="w-full h-full object-cover"
          />
        ) : (
          <User className={cn("text-primary-foreground", iconSizes[size])} strokeWidth={1.5} />
        )}
      </div>

      {/* Verified badge */}
      {isVerified && (
        <div 
          className={cn(
            "absolute bg-primary rounded-full flex items-center justify-center shadow-lg",
            badgeSizes[size]
          )}
        >
          <CheckCircle className="w-full h-full text-primary-foreground p-0.5" strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}
