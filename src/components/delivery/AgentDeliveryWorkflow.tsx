import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRDisplay } from "@/components/ui/QRDisplay";
import { Transaction } from "@/types/transaction";
import { toast } from "sonner";
import { 
  QrCode, 
  KeyRound, 
  CheckCircle, 
  ArrowLeft,
  Scan,
  Shield
} from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";

type WorkflowStep = "select" | "show_qr" | "scan_qr" | "enter_otp" | "confirmed";

interface AgentDeliveryWorkflowProps {
  transaction: Transaction;
  onConfirm: () => void;
  onBack: () => void;
}

// Demo OTP for testing
const DEMO_OTP = "123456";

export function AgentDeliveryWorkflow({ 
  transaction, 
  onConfirm, 
  onBack 
}: AgentDeliveryWorkflowProps) {
  const [step, setStep] = useState<WorkflowStep>("select");
  const [otpInput, setOtpInput] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otpInput === DEMO_OTP || otpInput.toUpperCase() === transaction.confirmationCode) {
      setIsConfirming(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep("confirmed");
      toast.success("Delivery confirmed!");
      setTimeout(() => {
        onConfirm();
      }, 1500);
    } else {
      toast.error("Invalid OTP. Demo OTP is 123456");
    }
  };

  const handleQrScan = async (result: string) => {
    try {
      // Check if it matches the confirmation code or URL
      if (result.includes(transaction.confirmationCode) || result === transaction.confirmationCode) {
        setIsConfirming(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStep("confirmed");
        toast.success("QR verified - Delivery confirmed!");
        setTimeout(() => {
          onConfirm();
        }, 1500);
      } else {
        toast.error("Invalid QR code");
      }
    } catch {
      toast.error("Could not read QR code");
    }
  };

  const qrValue = `${window.location.origin}/confirm/${transaction.id}?code=${transaction.confirmationCode}`;

  // Confirmed state
  if (step === "confirmed") {
    return (
      <GlassCard className="text-center py-8 animate-scale-in">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-teal to-ocean mx-auto mb-4 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Delivery Confirmed!
        </h2>
        <p className="text-sm text-muted-foreground">
          Awaiting buyer's final confirmation
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={step === "select" ? onBack : () => setStep("select")}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h2 className="font-bold text-foreground">Confirm Delivery</h2>
          <p className="text-sm text-muted-foreground">{transaction.productName}</p>
        </div>
      </div>

      {/* Method Selection */}
      {step === "select" && (
        <div className="space-y-3 animate-fade-up">
          <GlassCard
            variant="interactive"
            className="cursor-pointer"
            onClick={() => setStep("show_qr")}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-ocean/10">
                <QrCode className="w-6 h-6 text-ocean" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Show QR for Buyer</p>
                <p className="text-sm text-muted-foreground">
                  Let buyer scan your QR
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard
            variant="interactive"
            className="cursor-pointer"
            onClick={() => setStep("scan_qr")}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-teal/10">
                <Scan className="w-6 h-6 text-teal" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Scan Buyer's QR</p>
                <p className="text-sm text-muted-foreground">
                  Scan QR from buyer's app
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard
            variant="interactive"
            className="cursor-pointer"
            onClick={() => setStep("enter_otp")}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <KeyRound className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Enter OTP</p>
                <p className="text-sm text-muted-foreground">
                  Manual code entry (Demo: 123456)
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Show QR for Buyer to Scan */}
      {step === "show_qr" && (
        <GlassCard className="space-y-4 animate-fade-up">
          <div className="text-center">
            <p className="font-semibold text-foreground mb-2">Show to Buyer</p>
            <p className="text-sm text-muted-foreground">
              Ask the buyer to scan this QR code
            </p>
          </div>
          <QRDisplay value={qrValue} size={200} className="mx-auto" />
          <div className="text-center p-3 bg-muted/50 rounded-xl">
            <p className="text-xs text-muted-foreground">Confirmation Code</p>
            <p className="text-lg font-bold tracking-widest text-foreground">
              {transaction.confirmationCode}
            </p>
          </div>
        </GlassCard>
      )}

      {/* Scan Buyer's QR */}
      {step === "scan_qr" && (
        <GlassCard className="space-y-4 animate-fade-up">
          <div className="text-center">
            <p className="font-semibold text-foreground mb-2">Scan Buyer's QR</p>
            <p className="text-sm text-muted-foreground">
              Point camera at buyer's confirmation QR
            </p>
          </div>
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
        </GlassCard>
      )}

      {/* Enter OTP */}
      {step === "enter_otp" && (
        <GlassCard className="space-y-4 animate-fade-up">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mx-auto mb-3 flex items-center justify-center">
              <KeyRound className="w-7 h-7 text-primary" />
            </div>
            <p className="font-semibold text-foreground mb-1">Enter Confirmation OTP</p>
            <p className="text-sm text-muted-foreground">
              Ask buyer for the 6-digit code
            </p>
          </div>
          
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <Input
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="text-center text-2xl tracking-[0.5em] font-bold input-premium"
              maxLength={6}
              inputMode="numeric"
            />
            <p className="text-xs text-center text-muted-foreground">
              Demo OTP: <span className="font-mono font-bold">123456</span>
            </p>
            <Button 
              type="submit" 
              size="full" 
              disabled={isConfirming || otpInput.length !== 6}
              className="btn-glow"
            >
              {isConfirming ? "Confirming..." : "Confirm Delivery"}
            </Button>
          </form>
        </GlassCard>
      )}
    </div>
  );
}
