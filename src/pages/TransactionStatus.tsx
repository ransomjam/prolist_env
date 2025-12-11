import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { getTransaction, formatPriceXAF } from "@/lib/supabaseStorage";
import { SellerOrderActions } from "@/components/seller/SellerOrderActions";
import { AdminOrderActions } from "@/components/admin/AdminOrderActions";
import { AgentOrderActions } from "@/components/agent/AgentOrderActions";
import { Transaction, TransactionStatus as TxStatus } from "@/types/database";
import { toast } from "sonner";
import {
  Shield,
  Truck,
  MapPin,
  CheckCircle,
  Circle,
  Share2,
  Clock,
  Building2,
  UserCheck,
} from "lucide-react";

// Full timeline for sellers/admins/agents (shows all steps)
const fullSteps = [
  { status: "ESCROW_HELD" as TxStatus, label: "Escrow Secured", description: "Payment held securely", icon: Shield },
  { status: "IN_TRANSIT_TO_HUB" as TxStatus, label: "In Transit to Hub", description: "Item being shipped", icon: Truck },
  { status: "AT_PROLIST_HUB" as TxStatus, label: "At Hub", description: "Received at ProList hub", icon: Building2 },
  { status: "OUT_FOR_DELIVERY" as TxStatus, label: "Out for Delivery", description: "With delivery agent", icon: Truck },
  { status: "DELIVERED_AWAITING_CONFIRMATION" as TxStatus, label: "Delivered", description: "Awaiting buyer confirmation", icon: MapPin },
  { status: "COMPLETED" as TxStatus, label: "Completed", description: "Funds released to seller", icon: CheckCircle },
];

export default function TransactionStatus() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { authUser, loading } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!transactionId) {
      navigate("/home");
      return;
    }

    const fetchTransaction = async () => {
      try {
        const tx = await getTransaction(transactionId);
        if (!tx) {
          toast.error("Transaction not found");
          navigate("/home");
          return;
        }
        setTransaction(tx);
      } catch (error) {
        console.error("Error fetching transaction:", error);
        toast.error("Failed to load transaction");
        navigate("/home");
      } finally {
        setIsFetching(false);
      }
    };

    fetchTransaction();
  }, [transactionId, navigate]);

  const handleTransactionUpdate = (updated: Transaction) => {
    setTransaction(updated);
  };

  const getStatusIndex = (status: TxStatus) => {
    if (status === "PENDING_PAYMENT") return -1;
    return fullSteps.findIndex((s) => s.status === status);
  };

  if (loading || isFetching) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!transaction) {
    return null;
  }

  const currentIndex = getStatusIndex(transaction.status);
  const isSeller = authUser?.id === transaction.seller_id;
  const isAdmin = authUser?.primaryRole === "ADMIN";
  const isAgent = authUser?.primaryRole === "AGENT" && transaction.assigned_agent_id === authUser.id;
  const isAwaitingPayment = transaction.status === "PENDING_PAYMENT";

  // Convert to old format for action components
  const sessionForActions = authUser ? {
    id: authUser.id,
    role: authUser.primaryRole,
    isVerified: authUser.profile?.verification_status === "VERIFIED",
    name: authUser.profile?.name || "",
    phone: authUser.profile?.phone || "",
  } : null;

  const transactionForActions = {
    ...transaction,
    sellerId: transaction.seller_id,
    buyerId: transaction.buyer_id,
    productName: transaction.post?.title || "Order",
    deliveryFee: 0, // Not tracked separately in this schema
    deliveryLocation: transaction.delivery_location || "",
    deliveryArea: transaction.delivery_address || "",
    isPreOrder: false,
    assignedAgentId: transaction.assigned_agent_id,
    assignedAgentName: transaction.agent?.name,
    price: transaction.amount,
  };

  return (
    <div className="min-h-screen aurora-bg pb-20">
      <TopBar
        title="Order Tracking"
        showBack
        rightElement={
          isSeller && (
            <button
              onClick={() => navigate(`/smart-share/${transaction.id}`)}
              className="p-2 rounded-xl hover:bg-white/60 transition-colors"
            >
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          )
        }
      />

      <main className="p-4 space-y-4">
        {/* Header Card */}
        <GlassCard variant="elevated" className="animate-fade-up">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">{transaction.post?.title || "Order"}</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{transaction.delivery_location}</p>
              
              {/* Show assigned agent for admins/agents */}
              {(isAdmin || isAgent) && transaction.agent?.name && (
                <div className="flex items-center gap-1 mt-2 text-xs text-teal">
                  <UserCheck className="w-3 h-3" />
                  <span>Agent: {transaction.agent.name}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-foreground">
                {formatPriceXAF(transaction.amount)}
              </p>
              <StatusBadge
                variant={transaction.status === "COMPLETED" ? "success" : isAwaitingPayment ? "warning" : "escrow"}
                className="mt-1"
              >
                {isAwaitingPayment 
                  ? "Awaiting Payment" 
                  : "Escrow Protected"}
              </StatusBadge>
            </div>
          </div>
        </GlassCard>

        {/* Timeline */}
        <GlassCard className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <h3 className="font-semibold text-foreground mb-4">Delivery Timeline</h3>
          <div className="space-y-4">
            {fullSteps.map((step, index) => {
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              const Icon = step.icon;

              return (
                <div key={step.status} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? "bg-gradient-to-br from-primary to-teal text-primary-foreground" : "bg-accent text-muted-foreground"}`}>
                      {isCompleted ? <Icon className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </div>
                    {index < fullSteps.length - 1 && (
                      <div className={`w-0.5 h-8 transition-all duration-300 ${isCompleted && index < currentIndex ? "bg-primary" : "bg-accent"}`} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className={`font-medium ${isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                    {isCurrent && transaction.status !== "COMPLETED" && (
                      <p className="text-xs text-primary mt-1 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        In progress...
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Role-Based Action Cards */}
        {sessionForActions && !isAwaitingPayment && transaction.status !== "COMPLETED" && transaction.status !== "REFUNDED" && transaction.status !== "CANCELLED" && (
          <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
            {/* Seller Actions */}
            {isSeller && authUser?.primaryRole !== "ADMIN" && authUser?.primaryRole !== "AGENT" && (
              <SellerOrderActions
                transaction={transactionForActions as any}
                currentUser={sessionForActions as any}
                onUpdate={(updated) => handleTransactionUpdate(updated as any)}
              />
            )}

            {/* Admin Actions */}
            {isAdmin && (
              <AdminOrderActions
                transaction={transactionForActions as any}
                currentUser={sessionForActions as any}
                onUpdate={(updated) => handleTransactionUpdate(updated as any)}
              />
            )}

            {/* Agent Actions */}
            {isAgent && (
              <AgentOrderActions
                transaction={transactionForActions as any}
                currentUser={sessionForActions as any}
                onUpdate={(updated) => handleTransactionUpdate(updated as any)}
              />
            )}
          </div>
        )}

        {/* Completed State */}
        {transaction.status === "COMPLETED" && (
          <GlassCard className="text-center py-6 bg-primary/5 border-primary/20 animate-scale-in">
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="font-semibold text-foreground">Transaction Complete!</p>
            <p className="text-sm text-muted-foreground mt-1">Funds have been released to the seller</p>
          </GlassCard>
        )}
      </main>

      <BottomNav />
    </div>
  );
}