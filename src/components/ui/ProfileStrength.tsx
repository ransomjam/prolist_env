import { cn } from "@/lib/utils";
import { Shield, Star, Award, Zap } from "lucide-react";

interface ProfileStrengthProps {
  strength: number; // 0-100
  className?: string;
}

const badges = [
  { threshold: 25, icon: Shield, label: "Starter", color: "text-muted-foreground" },
  { threshold: 50, icon: Star, label: "Rising", color: "text-warning" },
  { threshold: 75, icon: Zap, label: "Power", color: "text-ocean" },
  { threshold: 100, icon: Award, label: "Elite", color: "text-primary" },
];

export function ProfileStrength({ strength, className }: ProfileStrengthProps) {
  const currentBadge = badges.reduce((prev, curr) => 
    strength >= curr.threshold ? curr : prev
  , badges[0]);

  const nextBadge = badges.find(b => b.threshold > strength);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <currentBadge.icon className={cn("w-5 h-5", currentBadge.color)} strokeWidth={2} />
          <span className="text-sm font-semibold text-foreground">
            Profile Strength
          </span>
        </div>
        <span className="text-sm font-bold text-gradient">{strength}%</span>
      </div>

      {/* Progress bar */}
      <div className="progress-premium">
        <div 
          className="progress-premium-fill"
          style={{ width: `${strength}%` }}
        />
      </div>

      {/* Badge progress */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <currentBadge.icon className={cn("w-4 h-4", currentBadge.color)} />
          <span className={cn("font-medium", currentBadge.color)}>{currentBadge.label}</span>
        </div>
        
        {nextBadge && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>{nextBadge.threshold - strength}% to</span>
            <nextBadge.icon className="w-4 h-4" />
            <span className="font-medium">{nextBadge.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
