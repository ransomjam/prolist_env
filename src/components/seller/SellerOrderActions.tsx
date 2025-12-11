import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SellerDropoffModal } from "@/components/delivery/SellerDropoffModal";
import { Transaction, User, LogisticsDetails } from "@/types/transaction";
import { saveTransaction, getTransaction } from "@/lib/storage";
import { getAvailableAction, PERMISSION_DENIED_MESSAGE } from "@/lib/permissions";
import { toast } from "sonner";
import { Truck, Clock, Package, CheckCircle } from "lucide-react";

interface SellerOrderActionsProps {
  transaction: Transaction;
  currentUser: User;
  onUpdate: (updated: Transaction) => void;
}

export function SellerOrderActions({
  transaction,
  currentUser,
  onUpdate,
}: SellerOrderActionsProps) {
  const [showDropoffModal, setShowDropoffModal] = useState(false);

  const action = getAvailableAction(currentUser, transaction);
  const isSeller = currentUser.id === transaction.sellerId;

  const handleDropoffSubmit = (logistics: LogisticsDetails) => {
    if (action?.type !== "seller_ship") {
      toast.error(PERMISSION_DENIED_MESSAGE);
      return;
    }

    const updatedTx: Transaction = {
      ...transaction,
      logistics,
      status: "in_transit_to_hub",
      updatedAt: new Date().toISOString(),
    };
    saveTransaction(updatedTx);
    onUpdate(updatedTx);
  };

  // Not the seller
  if (!isSeller) {
    return null;
  }

  // Seller can ship
  if (action?.type === "seller_ship") {
    return (
      <>
        <GlassCard className="space-y-4 border-2 border-primary/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Ready to Ship</h4>
              <p className="text-sm text-muted-foreground">
                Payment secured. Mark as shipped when ready.
              </p>
            </div>
          </div>

          <Button
            size="full"
            onClick={() => setShowDropoffModal(true)}
            className="btn-glow"
          >
            <Truck className="w-4 h-4 mr-2" />
            Mark In Transit
          </Button>
        </GlassCard>

        <SellerDropoffModal
          open={showDropoffModal}
          onOpenChange={setShowDropoffModal}
          transaction={transaction}
          onSubmit={handleDropoffSubmit}
        />
      </>
    );
  }

  // Seller waiting for other steps
  if (action?.type === "waiting" && isSeller) {
    const getWaitingContent = () => {
      switch (transaction.status) {
        case "in_transit_to_hub":
          return {
            icon: Truck,
            title: "Shipped",
            description: "Item is on the way to the hub",
          };
        case "at_prolist_hub":
          return {
            icon: Package,
            title: "At Hub",
            description: "Awaiting delivery agent assignment",
          };
        case "out_for_delivery":
          return {
            icon: Truck,
            title: "Out for Delivery",
            description: "Agent is delivering to buyer",
          };
        case "delivered_awaiting_confirmation":
          return {
            icon: Clock,
            title: "Delivered",
            description: "Waiting for buyer confirmation",
          };
        default:
          return {
            icon: Clock,
            title: action.label,
            description: "Processing...",
          };
      }
    };

    const content = getWaitingContent();
    const Icon = content.icon;

    return (
      <GlassCard className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-muted">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{content.title}</h4>
            <p className="text-sm text-muted-foreground">{content.description}</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Completed state for seller
  if (transaction.status === "completed") {
    return (
      <GlassCard className="text-center py-4 bg-primary/5 border-primary/20">
        <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="font-semibold text-foreground">Payment Released!</p>
        <p className="text-sm text-muted-foreground">
          Funds have been transferred to you
        </p>
      </GlassCard>
    );
  }

  return null;
}
