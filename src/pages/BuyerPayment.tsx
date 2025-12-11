import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getTransaction, updateTransactionStatus, saveTransaction } from "@/lib/storage";
import { attachInvoiceToTransaction } from "@/lib/invoice";
import { Transaction } from "@/types/transaction";
import { toast } from "sonner";
import { Shield, Package, MapPin, User, Lock, CheckCircle, FileText } from "lucide-react";

export default function BuyerPayment() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (!transactionId) {
      navigate("/");
      return;
    }

    const tx = getTransaction(transactionId);
    if (!tx) {
      toast.error("Transaction not found");
      navigate("/");
      return;
    }

    setTransaction(tx);
    setIsPaid(tx.status !== "awaiting_payment" && tx.status !== "pending_setup");
  }, [transactionId, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePayment = async () => {
    if (!transaction) return;

    setIsLoading(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update status to escrow_held
    updateTransactionStatus(transaction.id, "escrow_held");
    
    // Generate and attach invoice
    const invoice = attachInvoiceToTransaction(transaction.id);
    
    // Refresh transaction
    const updatedTx = getTransaction(transaction.id);
    if (updatedTx) {
      setTransaction(updatedTx);
    }
    
    setIsPaid(true);
    toast.success("Payment successful! Funds are now in escrow.");
    
    setIsLoading(false);
  };

  const handleViewInvoice = () => {
    navigate(`/invoice/${transaction?.id}`);
  };

  if (!transaction) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  const totalAmount = transaction.price + transaction.deliveryFee;

  return (
    <div className="min-h-screen aurora-bg p-4 safe-top safe-bottom">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center py-6 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-primary via-teal to-blue shadow-glow mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Secure Payment</h1>
          <p className="text-sm text-muted mt-1">Protected by ProList Escrow</p>
        </div>

        {/* Product Card */}
        <GlassCard variant="elevated" className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">
                {transaction.productName}
              </h2>
              {transaction.isPreOrder && (
                <StatusBadge variant="timer" className="mt-2">
                  Pre-order
                </StatusBadge>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Price Breakdown */}
        <GlassCard className="space-y-3 animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Product Price</span>
            <span className="font-medium text-foreground">
              {formatPrice(transaction.price)}
            </span>
          </div>

          {transaction.deliveryFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted">Delivery Fee</span>
              <span className="font-medium text-foreground">
                {formatPrice(transaction.deliveryFee)}
              </span>
            </div>
          )}

          <div className="h-px bg-accent" />

          <div className="flex justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-lg text-gradient">
              {formatPrice(totalAmount)}
            </span>
          </div>
        </GlassCard>

        {/* Seller & Delivery Info */}
        <GlassCard className="space-y-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-muted" />
            <div>
              <p className="text-xs text-muted">Seller</p>
              <p className="text-sm font-medium text-foreground">
                {transaction.sellerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-muted" />
            <div>
              <p className="text-xs text-muted">Delivery Location</p>
              <p className="text-sm font-medium text-foreground">
                {transaction.deliveryLocation}
                {transaction.deliveryArea && `, ${transaction.deliveryArea}`}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Escrow Info */}
        <GlassCard className="bg-primary/5 border-primary/20 animate-fade-up" style={{ animationDelay: "0.25s" }}>
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">
                Secure Escrow Protection
              </p>
              <p className="text-muted text-xs leading-relaxed">
                Your money is only released after you confirm delivery.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Payment Button / Success State */}
        {isPaid ? (
          <div className="space-y-3 animate-scale-in">
            <GlassCard className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="font-semibold text-foreground">Payment Complete!</p>
              <p className="text-sm text-muted mt-1">
                Funds are now held in escrow
              </p>
            </GlassCard>

            {/* View Invoice Button */}
            <Button
              size="full"
              onClick={handleViewInvoice}
              className="gap-2 bg-gradient-to-r from-primary to-ocean text-white rounded-2xl h-14"
            >
              <FileText className="w-5 h-5" />
              View Invoice
            </Button>

            {/* Track Order Button */}
            <Button
              variant="outline"
              size="full"
              onClick={() => navigate(`/track/${transaction.id}`)}
              className="gap-2 rounded-2xl"
            >
              Track Order
            </Button>
          </div>
        ) : (
          <Button
            size="full"
            onClick={handlePayment}
            disabled={isLoading}
            className="animate-fade-up btn-glow rounded-2xl h-14"
            style={{ animationDelay: "0.3s" }}
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Pay Securely {formatPrice(totalAmount)}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
