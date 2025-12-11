import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OTPInput } from "@/components/ui/OTPInput";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSession } from "@/lib/storage";

interface OTPModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: () => void;
  title?: string;
  description?: string;
}

export function OTPModal({
  open,
  onOpenChange,
  onVerify,
  title = "Verify Action",
  description = "Enter your PIN to confirm this action",
}: OTPModalProps) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const session = getSession();

  const handleVerify = async () => {
    if (otp.length !== 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }

    setIsVerifying(true);
    setError("");

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check against user's PIN (stored or demo)
    const userPin = session?.pin || "1234";
    
    if (otp === userPin) {
      toast.success("Verified successfully!");
      onVerify();
      onOpenChange(false);
      setOtp("");
    } else {
      setError("Invalid PIN. Please try again.");
    }

    setIsVerifying(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <OTPInput
            value={otp}
            onChange={setOtp}
            length={4}
            className="justify-center"
          />

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            onClick={handleVerify}
            disabled={isVerifying || otp.length !== 4}
            size="full"
            className="gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>

          <p className="text-xs text-muted text-center">
            Demo PIN: Check your demo account credentials
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
