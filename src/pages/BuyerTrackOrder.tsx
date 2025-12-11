import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { QRDisplay } from "@/components/ui/QRDisplay";
import { useAuth } from "@/hooks/useAuth";
import { getTransaction, updateTransactionStatus, formatPriceXAF } from "@/lib/supabaseStorage";
import { Transaction, TransactionStatus } from "@/types/database";
import { toast } from "sonner";
import {
  Shield,
  Package,
  Truck,
  MapPin,
  CheckCircle,
  Circle,
  QrCode,
  Clock,
  PartyPopper,
  FileText,
} from "lucide-react";

// Simplified timeline for buyers (hides internal hub steps)
const buyerSteps = [
  { status: "ESCROW_HELD" as TransactionStatus, label: "Payment Secured", description: "Your payment is protected", icon: Shield },
  { status: "IN_TRANSIT_TO_HUB" as TransactionStatus, label: "Shipped", description: "Seller has shipped the item", icon: Truck },
  { status: "OUT_FOR_DELIVERY" as TransactionStatus, label: "Out for Delivery", description: "On the way to you", icon: Truck },
  { status: "DELIVERED_AWAITING_CONFIRMATION" as TransactionStatus, label: "Delivered", description: "Confirm to release payment", icon: MapPin },
  { status: "COMPLETED" as TransactionStatus, label: "Completed", description: "Transaction complete", icon: CheckCircle },
];

export default function BuyerTrackOrder() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { authUser, loading } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!transactionId) {
      navigate("/");
      return;
    }

    const fetchTransaction = async () => {
      try {
        const tx = await getTransaction(transactionId);
        if (!tx) {
          toast.error("Order not found");
          navigate("/");
          return;
        }
        setTransaction(tx);
      } catch (error) {
        console.error("Error fetching transaction:", error);
        toast.error("Failed to load order");
        navigate("/");
      } finally {
        setIsFetching(false);
      }
    };

    fetchTransaction();
  }, [transactionId, navigate]);

  const getStatusIndex = (status: TransactionStatus) => {
    // Map internal statuses to simplified buyer view
    if (status === "AT_PROLIST_HUB") return 1; // Show as still "Shipped"
    if (status === "PENDING_PAYMENT") return -1;
    return buyerSteps.findIndex((s) => s.status === status);
  };

  const handleBuyerConfirm = async () => {
    if (!transaction || !authUser) return;

    // Check if user is the buyer
    if (transaction.buyer_id !== authUser.id) {
      toast.error("Only the buyer can confirm delivery");
      return;
    }

    if (transaction.status !== "DELIVERED_AWAITING_CONFIRMATION") {
      toast.error("Order is not ready for confirmation");
      return;
    }

    setIsConfirming(true);
    
    try {
      const updated = await updateTransactionStatus(transaction.id, "COMPLETED");
      if (updated) {
        setTransaction(updated);
        toast.success("Order confirmed! Payment released to seller.");
      }
    } catch (error) {
      console.error("Error confirming delivery:", error);
      toast.error("Failed to confirm delivery");
    } finally {
      setIsConfirming(false);
    }
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
  const isBuyer = authUser?.id === transaction.buyer_id;
  const isAwaitingPayment = transaction.status === "PENDING_PAYMENT";
  const isDelivered = transaction.status === "DELIVERED_AWAITING_CONFIRMATION";
  const isCompleted = transaction.status === "COMPLETED";
  const canConfirm = isBuyer && isDelivered;

  return (
    <div className="min-h-screen aurora-bg pb-20">
      <TopBar title="Track Order" showBack />

      <main className="p-4 space-y-4">
        {/* Order Summary */}
        <GlassCard variant="elevated" className="animate-fade-up">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-foreground">{transaction.post?.title || "Order"}</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                From {transaction.seller?.name || "Seller"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-foreground">
                {formatPriceXAF(transaction.amount)}
              </p>
              <StatusBadge
                variant={isCompleted ? "success" : "escrow"}
                className="mt-1"
              >
                {isCompleted ? "Complete" : "Protected"}
              </StatusBadge>
            </div>
          </div>
        </GlassCard>

        {/* Pending Payment Notice */}
        {isAwaitingPayment && (
          <GlassCard className="bg-warning/10 border-warning/30 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="text-center py-2">
              <p className="font-medium text-foreground">Awaiting Payment</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete your payment to proceed with the order
              </p>
              <Button
                className="mt-3"
                onClick={() => navigate(`/pay/${transaction.id}`)}
              >
                Complete Payment
              </Button>
            </div>
          </GlassCard>
        )}

        {/* Simplified Timeline for Buyer */}
        {!isAwaitingPayment && (
          <GlassCard className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="font-semibold text-foreground mb-4">Order Progress</h3>
            <div className="space-y-4">
              {buyerSteps.map((step, index) => {
                const isStepCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const Icon = step.icon;

                return (
                  <div key={step.status} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isStepCompleted
                            ? "bg-gradient-to-br from-primary to-teal text-primary-foreground"
                            : "bg-accent text-muted-foreground"
                        }`}
                      >
                        {isStepCompleted ? (
                          <Icon className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </div>
                      {index < buyerSteps.length - 1 && (
                        <div
                          className={`w-0.5 h-8 transition-all duration-300 ${
                            isStepCompleted && index < currentIndex
                              ? "bg-primary"
                              : "bg-accent"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p
                        className={`font-medium ${
                          isCurrent
                            ? "text-primary"
                            : isStepCompleted
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                      {isCurrent && !isCompleted && (
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
        )}

        {/* Delivery Info */}
        {transaction.delivery_location && !isAwaitingPayment && (
          <GlassCard className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Delivery to</p>
                <p className="font-medium text-foreground">
                  {transaction.delivery_location}
                  {transaction.delivery_address && `, ${transaction.delivery_address}`}
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Buyer Confirmation Section - Only shows when delivered AND user is buyer */}
        {isDelivered && isBuyer && (
          <GlassCard 
            className="space-y-4 animate-fade-up border-2 border-primary/30" 
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Item Delivered!</h3>
                <p className="text-sm text-muted-foreground">
                  Confirm receipt to release payment
                </p>
              </div>
            </div>

            {/* QR Code for verification */}
            {showQR ? (
              <div className="space-y-3">
                <QRDisplay
                  value={`${window.location.origin}/confirm/${transaction.id}`}
                  size={180}
                  className="mx-auto"
                />
                <p className="text-center text-xs text-muted-foreground">
                  OTP: <span className="font-mono font-bold">{transaction.otp_code || "------"}</span>
                </p>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQR(true)}
                className="w-full gap-2"
              >
                <QrCode className="w-4 h-4" />
                Show Verification QR
              </Button>
            )}

            <Button
              size="full"
              onClick={handleBuyerConfirm}
              disabled={isConfirming || !canConfirm}
              className="btn-glow"
            >
              {isConfirming ? (
                "Confirming..."
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirm Received
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Only confirm after you've received and checked your item
            </p>
          </GlassCard>
        )}

        {/* Waiting for buyer (shown to non-buyers when delivered) */}
        {isDelivered && !isBuyer && (
          <GlassCard className="text-center py-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Waiting for buyer to confirm receipt
            </p>
          </GlassCard>
        )}

        {/* Completion Celebration */}
        {isCompleted && (
          <GlassCard className="text-center py-8 bg-primary/5 border-primary/20 animate-scale-in">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary via-teal to-ocean mx-auto mb-4 flex items-center justify-center">
              <PartyPopper className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Order Complete!
            </h2>
            <p className="text-sm text-muted-foreground">
              Payment released securely to seller
            </p>
          </GlassCard>
        )}

        {/* View All Orders Link */}
        <Button
          variant="ghost"
          size="full"
          onClick={() => navigate("/my-orders")}
        >
          View All My Orders
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}