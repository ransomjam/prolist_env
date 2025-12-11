import { cn } from "@/lib/utils";
import { 
  Clock, 
  CreditCard, 
  Shield, 
  Truck, 
  Package, 
  CheckCircle,
  XCircle,
  LucideIcon
} from "lucide-react";
import { TransactionStatus } from "@/types/transaction";

interface TimelineStep {
  status: TransactionStatus;
  label: string;
  description: string;
  icon: LucideIcon;
}

const timelineSteps: TimelineStep[] = [
  { 
    status: "pending_setup", 
    label: "Request Sent", 
    description: "Payment request created",
    icon: Clock 
  },
  { 
    status: "awaiting_payment", 
    label: "Awaiting Payment", 
    description: "Waiting for buyer payment",
    icon: CreditCard 
  },
  { 
    status: "escrow_held", 
    label: "Escrow Secured", 
    description: "Payment held securely",
    icon: Shield 
  },
  { 
    status: "in_transit_to_hub", 
    label: "Shipped", 
    description: "Item on the way to hub",
    icon: Truck 
  },
  { 
    status: "at_prolist_hub", 
    label: "At Hub", 
    description: "Received at ProList hub",
    icon: Package 
  },
  { 
    status: "out_for_delivery", 
    label: "Out for Delivery", 
    description: "With delivery agent",
    icon: Truck 
  },
  { 
    status: "delivered_awaiting_confirmation", 
    label: "Delivered", 
    description: "Awaiting confirmation",
    icon: Package 
  },
  { 
    status: "completed", 
    label: "Completed", 
    description: "Transaction complete",
    icon: CheckCircle 
  },
];

interface TransactionTimelineProps {
  currentStatus: TransactionStatus;
  className?: string;
}

export function TransactionTimeline({ currentStatus, className }: TransactionTimelineProps) {
  const currentIndex = timelineSteps.findIndex(s => s.status === currentStatus);
  const isRefunded = currentStatus === "refunded";

  return (
    <div className={cn("space-y-1", className)}>
      {timelineSteps.map((step, index) => {
        const isCompleted = index <= currentIndex && !isRefunded;
        const isCurrent = index === currentIndex && !isRefunded;
        const Icon = step.icon;

        return (
          <div key={step.status} className="timeline-step">
            {/* Connector line */}
            {index < timelineSteps.length - 1 && (
              <div 
                className={cn(
                  "absolute left-[11px] top-7 w-0.5 h-[calc(100%-4px)]",
                  isCompleted && index < currentIndex 
                    ? "bg-gradient-to-b from-primary to-primary" 
                    : "bg-gradient-to-b from-border to-transparent"
                )}
              />
            )}

            {/* Step dot */}
            <div 
              className={cn(
                "absolute left-0 w-6 h-6 rounded-full flex items-center justify-center transition-all",
                isCompleted 
                  ? "bg-gradient-to-br from-ocean via-teal to-primary shadow-glow" 
                  : "bg-muted"
              )}
            >
              <Icon 
                className={cn(
                  "w-3.5 h-3.5",
                  isCompleted ? "text-primary-foreground" : "text-muted-foreground"
                )} 
                strokeWidth={2.5} 
              />
            </div>

            {/* Content */}
            <div className={cn("pb-5", index === timelineSteps.length - 1 && "pb-0")}>
              <p 
                className={cn(
                  "font-semibold text-sm",
                  isCompleted ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
                {isCurrent && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-primary/10 text-primary">
                    Current
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}

      {isRefunded && (
        <div className="timeline-step">
          <div className="absolute left-0 w-6 h-6 rounded-full flex items-center justify-center bg-destructive shadow-lg">
            <XCircle className="w-3.5 h-3.5 text-destructive-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-semibold text-sm text-destructive">Refunded</p>
            <p className="text-xs text-muted-foreground mt-0.5">Transaction was refunded</p>
          </div>
        </div>
      )}
    </div>
  );
}
