import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { AgentDeliveryWorkflow } from "@/components/delivery/AgentDeliveryWorkflow";
import { Transaction, User } from "@/types/transaction";
import { updateTransactionStatus, getTransaction } from "@/lib/storage";
import { getAvailableAction, PERMISSION_DENIED_MESSAGE } from "@/lib/permissions";
import { toast } from "sonner";
import { Truck, MapPin, CheckCircle, Clock } from "lucide-react";

interface AgentOrderActionsProps {
  transaction: Transaction;
  currentUser: User;
  onUpdate: (updated: Transaction) => void;
}

export function AgentOrderActions({
  transaction,
  currentUser,
  onUpdate,
}: AgentOrderActionsProps) {
  const [showWorkflow, setShowWorkflow] = useState(false);

  const action = getAvailableAction(currentUser, transaction);
  const isAssigned = transaction.assignedAgentId === currentUser.id;

  const handleDeliveryConfirm = () => {
    if (action?.type !== "agent_deliver") {
      toast.error(PERMISSION_DENIED_MESSAGE);
      return;
    }

    updateTransactionStatus(transaction.id, "delivered_awaiting_confirmation");
    const updated = getTransaction(transaction.id);
    if (updated) onUpdate(updated);
    setShowWorkflow(false);
  };

  // Not assigned to this agent
  if (!isAssigned) {
    return null;
  }

  // Show delivery workflow
  if (showWorkflow) {
    return (
      <AgentDeliveryWorkflow
        transaction={transaction}
        onConfirm={handleDeliveryConfirm}
        onBack={() => setShowWorkflow(false)}
      />
    );
  }

  // Agent can deliver
  if (action?.type === "agent_deliver") {
    return (
      <GlassCard className="space-y-4 border-2 border-teal/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal/10">
            <Truck className="w-5 h-5 text-teal" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Ready to Deliver</h4>
            <p className="text-sm text-muted-foreground">
              {transaction.deliveryLocation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-xl">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <div className="text-sm">
            <span className="text-muted-foreground">Buyer: </span>
            <span className="font-medium text-foreground">
              {transaction.buyerName || transaction.buyerPhone}
            </span>
          </div>
        </div>

        <Button
          size="full"
          onClick={() => setShowWorkflow(true)}
          className="bg-teal hover:bg-teal/90"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Start Delivery Confirmation
        </Button>
      </GlassCard>
    );
  }

  // Waiting for buyer confirmation
  if (action?.type === "waiting" && transaction.status === "delivered_awaiting_confirmation") {
    return (
      <GlassCard className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-ocean/10">
            <Clock className="w-5 h-5 text-ocean" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Delivered</h4>
            <p className="text-sm text-muted-foreground">
              Waiting for buyer to confirm receipt
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Completed
  if (transaction.status === "completed") {
    return (
      <GlassCard className="text-center py-4 bg-primary/5 border-primary/20">
        <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="font-semibold text-foreground">Delivery Complete</p>
        <p className="text-sm text-muted-foreground">
          Buyer confirmed receipt
        </p>
      </GlassCard>
    );
  }

  return null;
}
