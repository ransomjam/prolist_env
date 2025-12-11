import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTransaction, updateTransactionStatus } from "@/lib/storage";
import { Transaction } from "@/types/transaction";
import { toast } from "sonner";
import { Shield, CheckCircle, QrCode, KeyRound, Package } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";

type ConfirmMethod = "select" | "qr" | "otp";

export default function ConfirmDelivery() {
  const { transactionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [method, setMethod] = useState<ConfirmMethod>("select");
  const [otpInput, setOtpInput] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

    // Check if code is in URL params (from QR scan)
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl && codeFromUrl === tx.confirmationCode) {
      confirmDelivery();
    }
  }, [transactionId, searchParams, navigate]);

  const confirmDelivery = async () => {
    if (!transaction) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    updateTransactionStatus(transaction.id, "completed");
    setIsConfirmed(true);
    toast.success("Delivery confirmed! Funds released to seller.");
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!transaction) return;

    if (otpInput.toUpperCase() === transaction.confirmationCode) {
      confirmDelivery();
    } else {
      toast.error("Invalid confirmation code");
    }
  };

  const handleQrScan = (result: string) => {
    if (!transaction) return;

    // Extract code from URL or direct code
    const url = new URL(result);
    const code = url.searchParams.get("code");

    if (code === transaction.confirmationCode) {
      confirmDelivery();
    } else {
      toast.error("Invalid QR code");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!transaction) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center p-4">
        <GlassCard variant="elevated" className="text-center py-8 max-w-sm w-full animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-teal mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Delivery Confirmed!
          </h2>
          <p className="text-sm text-muted mb-4">
            Funds have been released to the seller
          </p>
          <p className="text-2xl font-bold text-gradient">
            {formatPrice(transaction.price + transaction.deliveryFee)}
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg p-4 safe-top safe-bottom">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center py-6 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-primary via-teal to-blue shadow-glow mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Confirm Delivery</h1>
          <p className="text-sm text-muted mt-1">
            Verify receipt to release payment
          </p>
        </div>

        {/* Product Info */}
        <GlassCard className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                {transaction.productName}
              </p>
              <p className="text-lg font-bold text-gradient">
                {formatPrice(transaction.price + transaction.deliveryFee)}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Method Selection */}
        {method === "select" && (
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <GlassCard
              className="cursor-pointer hover:shadow-card transition-shadow"
              onClick={() => setMethod("qr")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue/10">
                  <QrCode className="w-6 h-6 text-blue" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Scan QR Code</p>
                  <p className="text-sm text-muted">
                    Scan the seller's QR code
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard
              className="cursor-pointer hover:shadow-card transition-shadow"
              onClick={() => setMethod("otp")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-teal/10">
                  <KeyRound className="w-6 h-6 text-teal" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Enter Code</p>
                  <p className="text-sm text-muted">
                    Enter the confirmation code
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* QR Scanner */}
        {method === "qr" && (
          <GlassCard className="space-y-4 animate-fade-up">
            <h3 className="font-semibold text-foreground text-center">
              Scan QR Code
            </h3>
            <div className="rounded-xl overflow-hidden">
              <Scanner
                onScan={(result) => {
                  if (result?.[0]?.rawValue) {
                    handleQrScan(result[0].rawValue);
                  }
                }}
                styles={{
                  container: { borderRadius: "12px" },
                }}
              />
            </div>
            <Button variant="outline" size="full" onClick={() => setMethod("select")}>
              Back
            </Button>
          </GlassCard>
        )}

        {/* OTP Entry */}
        {method === "otp" && (
          <GlassCard className="space-y-4 animate-fade-up">
            <h3 className="font-semibold text-foreground text-center">
              Enter Confirmation Code
            </h3>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <Input
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                className="text-center text-xl tracking-widest font-bold"
                maxLength={6}
              />
              <Button type="submit" size="full" disabled={isLoading || otpInput.length !== 6}>
                {isLoading ? "Confirming..." : "Confirm Received"}
              </Button>
            </form>
            <Button variant="outline" size="full" onClick={() => setMethod("select")}>
              Back
            </Button>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
