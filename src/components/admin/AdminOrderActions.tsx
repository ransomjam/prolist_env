import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Transaction, User } from "@/types/transaction";
import { getUsers, updateTransactionStatus, saveTransaction, getTransaction } from "@/lib/storage";
import { getAvailableAction, PERMISSION_DENIED_MESSAGE } from "@/lib/permissions";
import { toast } from "sonner";
import { Package, Truck, UserCheck, CheckCircle } from "lucide-react";

interface AdminOrderActionsProps {
  transaction: Transaction;
  currentUser: User;
  onUpdate: (updated: Transaction) => void;
}

export function AdminOrderActions({
  transaction,
  currentUser,
  onUpdate,
}: AdminOrderActionsProps) {
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const action = getAvailableAction(currentUser, transaction);
  const agents = getUsers().filter((u) => u.role === "AGENT");

  const handleReceiveAtHub = async () => {
    if (action?.type !== "admin_receive") {
      toast.error(PERMISSION_DENIED_MESSAGE);
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    updateTransactionStatus(transaction.id, "at_prolist_hub");
    const updated = getTransaction(transaction.id);
    if (updated) onUpdate(updated);

    toast.success("Marked as received at hub");
    setIsLoading(false);
  };

  const handleAssignAgent = async () => {
    if (action?.type !== "admin_assign") {
      toast.error(PERMISSION_DENIED_MESSAGE);
      return;
    }

    if (!selectedAgentId) {
      toast.error("Please select a delivery agent");
      return;
    }

    const agent = agents.find((a) => a.id === selectedAgentId);
    if (!agent) {
      toast.error("Agent not found");
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    // Update transaction with agent and status
    const updatedTx: Transaction = {
      ...transaction,
      assignedAgentId: agent.id,
      assignedAgentName: agent.name,
      status: "out_for_delivery",
      updatedAt: new Date().toISOString(),
    };
    saveTransaction(updatedTx);
    onUpdate(updatedTx);

    toast.success(`Assigned to ${agent.name}`);
    setIsLoading(false);
  };

  // Show appropriate action based on status
  if (action?.type === "admin_receive") {
    return (
      <GlassCard className="space-y-4 border-2 border-ocean/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-ocean/10">
            <Package className="w-5 h-5 text-ocean" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Item In Transit</h4>
            <p className="text-sm text-muted-foreground">
              Confirm when item arrives at hub
            </p>
          </div>
        </div>

        <Button
          size="full"
          onClick={handleReceiveAtHub}
          disabled={isLoading}
          className="bg-ocean hover:bg-ocean/90"
        >
          {isLoading ? (
            "Processing..."
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Received at Hub
            </>
          )}
        </Button>
      </GlassCard>
    );
  }

  if (action?.type === "admin_assign") {
    return (
      <GlassCard className="space-y-4 border-2 border-teal/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal/10">
            <UserCheck className="w-5 h-5 text-teal" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">At Hub</h4>
            <p className="text-sm text-muted-foreground">
              Assign a delivery agent
            </p>
          </div>
        </div>

        <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
          <SelectTrigger>
            <SelectValue placeholder="Select delivery agent" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name} - {agent.city || "No city"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="full"
          onClick={handleAssignAgent}
          disabled={isLoading || !selectedAgentId}
          className="bg-teal hover:bg-teal/90"
        >
          {isLoading ? (
            "Assigning..."
          ) : (
            <>
              <Truck className="w-4 h-4 mr-2" />
              Assign & Dispatch
            </>
          )}
        </Button>
      </GlassCard>
    );
  }

  // Show waiting state for other statuses
  if (action?.type === "waiting") {
    return (
      <GlassCard className="text-center py-4 opacity-75">
        <p className="text-sm text-muted-foreground">{action.label}</p>
      </GlassCard>
    );
  }

  return null;
}
