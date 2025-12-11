import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertCircle, Shield, Truck, Package, Ban, CreditCard, Hourglass, Warehouse } from "lucide-react";

type BadgeVariant = 
  | "pending_setup"
  | "awaiting_payment" 
  | "escrow_held"
  | "in_transit_to_hub"
  | "at_prolist_hub"
  | "out_for_delivery"
  | "delivered_awaiting_confirmation"
  | "completed"
  | "refunded"
  | "escrow"
  | "lane"
  | "timer"
  | "warning"
  | "error"
  | "success";

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  icon?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  pending_setup: "bg-[hsl(var(--status-pending)/0.1)] border-[hsl(var(--status-pending)/0.3)] text-[hsl(var(--status-pending))]",
  awaiting_payment: "bg-[hsl(var(--status-warning)/0.1)] border-[hsl(var(--status-warning)/0.3)] text-[hsl(var(--status-warning))]",
  escrow_held: "bg-[hsl(var(--status-active)/0.1)] border-[hsl(var(--status-active)/0.3)] text-[hsl(var(--status-active))]",
  in_transit_to_hub: "bg-[hsl(var(--status-active)/0.1)] border-[hsl(var(--status-active)/0.3)] text-[hsl(var(--status-active))]",
  at_prolist_hub: "bg-[hsl(var(--ocean)/0.1)] border-[hsl(var(--ocean)/0.3)] text-[hsl(var(--ocean))]",
  out_for_delivery: "bg-[hsl(var(--teal)/0.1)] border-[hsl(var(--teal)/0.3)] text-[hsl(var(--teal))]",
  delivered_awaiting_confirmation: "bg-[hsl(var(--status-timer)/0.1)] border-[hsl(var(--status-timer)/0.3)] text-[hsl(var(--status-timer))]",
  completed: "bg-[hsl(var(--status-success)/0.1)] border-[hsl(var(--status-success)/0.3)] text-[hsl(var(--status-success))]",
  refunded: "bg-[hsl(var(--status-error)/0.1)] border-[hsl(var(--status-error)/0.3)] text-[hsl(var(--status-error))]",
  escrow: "bg-[hsl(var(--status-active)/0.1)] border-[hsl(var(--status-active)/0.3)] text-[hsl(var(--status-active))]",
  lane: "bg-[hsl(var(--status-active)/0.1)] border-[hsl(var(--status-active)/0.3)] text-[hsl(var(--status-active))]",
  timer: "bg-[hsl(var(--status-timer)/0.1)] border-[hsl(var(--status-timer)/0.3)] text-[hsl(var(--status-timer))]",
  warning: "bg-[hsl(var(--status-warning)/0.1)] border-[hsl(var(--status-warning)/0.3)] text-[hsl(var(--status-warning))]",
  error: "bg-[hsl(var(--status-error)/0.1)] border-[hsl(var(--status-error)/0.3)] text-[hsl(var(--status-error))]",
  success: "bg-[hsl(var(--status-success)/0.1)] border-[hsl(var(--status-success)/0.3)] text-[hsl(var(--status-success))]",
};

const variantIcons: Record<BadgeVariant, React.ElementType> = {
  pending_setup: Hourglass,
  awaiting_payment: CreditCard,
  escrow_held: Shield,
  in_transit_to_hub: Truck,
  at_prolist_hub: Warehouse,
  out_for_delivery: Truck,
  delivered_awaiting_confirmation: Package,
  completed: CheckCircle,
  refunded: Ban,
  escrow: Shield,
  lane: Truck,
  timer: Clock,
  warning: AlertCircle,
  error: AlertCircle,
  success: CheckCircle,
};

export function StatusBadge({
  variant,
  children,
  icon = true,
  className,
}: StatusBadgeProps) {
  const Icon = variantIcons[variant] || Clock;
  const styles = variantStyles[variant] || variantStyles.pending_setup;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-semibold uppercase tracking-wide border backdrop-blur-sm",
        styles,
        className
      )}
    >
      {icon && Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}
