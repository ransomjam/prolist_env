import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSession, getSellerTransactions, getBuyerTransactions, getTransactions, formatPriceXAF, getUsers, saveTransaction, getTransaction } from "@/lib/storage";
import { Transaction, TransactionStatus, User } from "@/types/transaction";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";
import { 
  CreditCard, 
  User as UserIcon, 
  ShoppingBag, 
  Store, 
  Share2, 
  Shield, 
  Truck, 
  CheckCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  FileText,
  Warehouse,
  UserCheck,
  QrCode,
  KeyRound,
  Package
} from "lucide-react";

const statusLabels: Record<TransactionStatus, string> = {
  pending_setup: "Setting Up",
  awaiting_payment: "Awaiting Payment",
  escrow_held: "Escrow Held",
  in_transit_to_hub: "To Hub",
  at_prolist_hub: "At Hub",
  out_for_delivery: "Out for Delivery",
  delivered_awaiting_confirmation: "Awaiting Confirm",
  completed: "Completed",
  refunded: "Refunded",
};

const statusVariants: Record<TransactionStatus, TransactionStatus> = {
  pending_setup: "pending_setup",
  awaiting_payment: "awaiting_payment",
  escrow_held: "escrow_held",
  in_transit_to_hub: "in_transit_to_hub",
  at_prolist_hub: "at_prolist_hub",
  out_for_delivery: "out_for_delivery",
  delivered_awaiting_confirmation: "delivered_awaiting_confirmation",
  completed: "completed",
  refunded: "refunded",
};

const statusIcons: Record<TransactionStatus, React.ComponentType<{ className?: string }>> = {
  pending_setup: Clock,
  awaiting_payment: CreditCard,
  escrow_held: Shield,
  in_transit_to_hub: Truck,
  at_prolist_hub: Warehouse,
  out_for_delivery: Truck,
  delivered_awaiting_confirmation: CheckCircle,
  completed: CheckCircle,
  refunded: CreditCard,
};

export default function Payments() {
  const navigate = useNavigate();
  const [buyerTransactions, setBuyerTransactions] = useState<Transaction[]>([]);
  const [sellerTransactions, setSellerTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [agentTransactions, setAgentTransactions] = useState<Transaction[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const { markTypeRead } = useNotifications();
  
  const session = getSession();
  const sessionId = session?.id;
  const userRole = session?.role || "BUYER_SELLER";
  const isAdmin = userRole === "ADMIN";
  const isAgent = userRole === "AGENT";

  // Load transactions
  useEffect(() => {
    if (!sessionId) {
      navigate("/auth/login");
      return;
    }

    setBuyerTransactions(getBuyerTransactions(sessionId));
    setSellerTransactions(getSellerTransactions(sessionId));
    
    if (isAdmin) {
      setAllTransactions(getTransactions());
      const allUsers = getUsers();
      setAgents(allUsers.filter(u => u.role === "AGENT"));
    }
    
    if (isAgent) {
      const all = getTransactions();
      setAgentTransactions(all.filter(t => t.assignedAgentId === sessionId));
    }
  }, [navigate, sessionId, isAdmin, isAgent]);

  // Mark notifications as read once on mount
  useEffect(() => {
    if (!sessionId) return;
    
    if (isAdmin) {
      markTypeRead(["admin"]);
    } else if (isAgent) {
      markTypeRead(["agent"]);
    } else {
      markTypeRead(["buyer", "seller"]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const isVerifiedSeller = session?.isVerified || session?.verificationStatus === "VERIFIED";

  // Stats for buyer
  const buyerPending = buyerTransactions.filter((t) => 
    t.status === "pending_setup" || t.status === "awaiting_payment"
  ).length;
  const buyerActive = buyerTransactions.filter((t) => 
    t.status !== "pending_setup" && t.status !== "awaiting_payment" && 
    t.status !== "completed" && t.status !== "refunded"
  ).length;
  const buyerCompleted = buyerTransactions.filter((t) => 
    t.status === "completed" || t.status === "refunded"
  ).length;

  // Stats for seller
  const sellerPending = sellerTransactions.filter((t) => 
    t.status === "pending_setup" || t.status === "awaiting_payment"
  ).length;
  const sellerActive = sellerTransactions.filter((t) => 
    t.status !== "pending_setup" && t.status !== "awaiting_payment" && 
    t.status !== "completed" && t.status !== "refunded"
  ).length;
  const sellerCompleted = sellerTransactions.filter((t) => 
    t.status === "completed" || t.status === "refunded"
  ).length;

  // Admin stats
  const adminPending = allTransactions.filter((t) => 
    t.status === "in_transit_to_hub"
  ).length;
  const adminAtHub = allTransactions.filter((t) => 
    t.status === "at_prolist_hub"
  ).length;
  const adminDelivering = allTransactions.filter((t) => 
    t.status === "out_for_delivery"
  ).length;

  // Agent stats
  const agentPending = agentTransactions.filter((t) => 
    t.status === "out_for_delivery"
  ).length;
  const agentDelivered = agentTransactions.filter((t) => 
    t.status === "delivered_awaiting_confirmation" || t.status === "completed"
  ).length;

  // Admin actions
  const handleMarkAtHub = (transactionId: string) => {
    const tx = getTransaction(transactionId);
    if (tx) {
      tx.status = "at_prolist_hub";
      tx.updatedAt = new Date().toISOString();
      saveTransaction(tx);
      setAllTransactions(getTransactions());
      toast.success("Marked as received at hub");
    }
  };

  const handleAssignAgent = (transactionId: string, agentId: string) => {
    const tx = getTransaction(transactionId);
    const agent = agents.find(a => a.id === agentId);
    if (tx && agent) {
      tx.assignedAgentId = agentId;
      tx.assignedAgentName = agent.name;
      tx.status = "out_for_delivery";
      tx.updatedAt = new Date().toISOString();
      saveTransaction(tx);
      setAllTransactions(getTransactions());
      toast.success(`Assigned to ${agent.name}`);
    }
  };

  // Agent delivery action
  const handleAgentDelivered = (transactionId: string) => {
    const tx = getTransaction(transactionId);
    if (tx) {
      tx.status = "delivered_awaiting_confirmation";
      tx.updatedAt = new Date().toISOString();
      saveTransaction(tx);
      setAgentTransactions(prev => prev.map(t => t.id === transactionId ? tx : t));
      toast.success("Marked as delivered - awaiting buyer confirmation");
    }
  };

  const renderTransactionList = (
    transactions: Transaction[],
    emptyMessage: string,
    emptySubMessage: string,
    role: "buyer" | "seller" | "admin" | "agent"
  ) => {
    if (transactions.length === 0) {
      return (
        <GlassCard className="text-center py-16">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-muted to-muted/30 mx-auto mb-4 flex items-center justify-center">
            {role === "buyer" ? (
              <ShoppingBag className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
            ) : role === "admin" ? (
              <Warehouse className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
            ) : role === "agent" ? (
              <Truck className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
            ) : (
              <Store className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
            )}
          </div>
          <p className="font-bold text-foreground">{emptyMessage}</p>
          <p className="text-sm text-muted-foreground mt-1">{emptySubMessage}</p>
        </GlassCard>
      );
    }

    const pending = transactions.filter((t) => t.status === "pending_setup" || t.status === "awaiting_payment");
    const active = transactions.filter(
      (t) => t.status !== "pending_setup" && t.status !== "awaiting_payment" && 
             t.status !== "completed" && t.status !== "refunded"
    );
    const completed = transactions.filter((t) => t.status === "completed" || t.status === "refunded");

    return (
      <div className="space-y-6">
        {pending.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-foreground px-1">Pending</h3>
            <div className="space-y-3">
              {pending.map((transaction) => (
                <TransactionCard 
                  key={transaction.id} 
                  transaction={transaction} 
                  role={role}
                  agents={agents}
                  onMarkAtHub={handleMarkAtHub}
                  onAssignAgent={handleAssignAgent}
                  onAgentDelivered={handleAgentDelivered}
                  onClick={() => {
                    if (role === "buyer") navigate(`/track/${transaction.id}`);
                    else if (role === "seller") navigate(`/status/${transaction.id}`);
                    else navigate(`/invoice/${transaction.id}`);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {active.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-foreground px-1">Active</h3>
            <div className="space-y-3">
              {active.map((transaction) => (
                <TransactionCard 
                  key={transaction.id} 
                  transaction={transaction} 
                  role={role}
                  agents={agents}
                  onMarkAtHub={handleMarkAtHub}
                  onAssignAgent={handleAssignAgent}
                  onAgentDelivered={handleAgentDelivered}
                  onClick={() => {
                    if (role === "buyer") navigate(`/track/${transaction.id}`);
                    else if (role === "seller") navigate(`/status/${transaction.id}`);
                    else navigate(`/invoice/${transaction.id}`);
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {completed.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-foreground px-1">Completed</h3>
            <div className="space-y-3">
              {completed.slice(0, 5).map((transaction) => (
                <TransactionCard 
                  key={transaction.id} 
                  transaction={transaction} 
                  role={role}
                  agents={agents}
                  onMarkAtHub={handleMarkAtHub}
                  onAssignAgent={handleAssignAgent}
                  onAgentDelivered={handleAgentDelivered}
                  onClick={() => {
                    if (role === "buyer") navigate(`/track/${transaction.id}`);
                    else if (role === "seller") navigate(`/status/${transaction.id}`);
                    else navigate(`/invoice/${transaction.id}`);
                  }}
                  isCompleted
                />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  // Dynamic tab labels based on role
  const getTabConfig = () => {
    if (isAdmin) {
      return {
        leftTab: { value: "admin", label: "Admin", icon: Warehouse },
        rightTab: { value: "buyer", label: "As Buyer", icon: ShoppingBag },
      };
    }
    if (isAgent) {
      return {
        leftTab: { value: "agent", label: "As Agent", icon: Truck },
        rightTab: { value: "buyer", label: "As Buyer", icon: ShoppingBag },
      };
    }
    return {
      leftTab: { value: "buyer", label: "As Buyer", icon: ShoppingBag },
      rightTab: { value: "seller", label: "As Seller", icon: Store },
    };
  };

  const tabConfig = getTabConfig();

  return (
    <div className="min-h-screen page-premium pb-24">
      <TopBar title="Orders" />

      <main className="relative z-10 p-4 space-y-4">
        <Tabs defaultValue={tabConfig.leftTab.value} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-5 p-1 bg-muted/50 rounded-2xl">
            <TabsTrigger 
              value={tabConfig.leftTab.value} 
              className="gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-semibold"
            >
              <tabConfig.leftTab.icon className="w-4 h-4" />
              {tabConfig.leftTab.label}
            </TabsTrigger>
            <TabsTrigger 
              value={tabConfig.rightTab.value} 
              className="gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm font-semibold" 
              onClick={() => {
                if (!isAdmin && !isAgent && tabConfig.rightTab.value === "seller" && !isVerifiedSeller) {
                  toast.error("Verify your account to start selling securely.");
                  navigate("/verify");
                }
              }}
            >
              <tabConfig.rightTab.icon className="w-4 h-4" />
              {tabConfig.rightTab.label}
            </TabsTrigger>
          </TabsList>

          {/* ADMIN TAB */}
          {isAdmin && (
            <TabsContent value="admin" className="space-y-5">
              <div className="px-1">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Admin Dashboard</span>
              </div>

              <div className="grid grid-cols-3 gap-3 animate-fade-up">
                <StatCard icon={Truck} value={adminPending} label="To Hub" variant="warning" />
                <StatCard icon={Warehouse} value={adminAtHub} label="At Hub" variant="ocean" />
                <StatCard icon={Package} value={adminDelivering} label="Delivering" variant="teal" />
              </div>

              {renderTransactionList(
                allTransactions,
                "No orders in system",
                "Orders will appear here when buyers make purchases.",
                "admin"
              )}
            </TabsContent>
          )}

          {/* AGENT TAB */}
          {isAgent && (
            <TabsContent value="agent" className="space-y-5">
              <div className="px-1">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">My Deliveries</span>
              </div>

              <div className="grid grid-cols-2 gap-3 animate-fade-up">
                <StatCard icon={Truck} value={agentPending} label="To Deliver" variant="ocean" />
                <StatCard icon={CheckCircle} value={agentDelivered} label="Delivered" variant="primary" />
              </div>

              {renderTransactionList(
                agentTransactions,
                "No assigned deliveries",
                "Deliveries assigned to you will appear here.",
                "agent"
              )}
            </TabsContent>
          )}

          {/* BUYER TAB (for all roles) */}
          <TabsContent value="buyer" className="space-y-5">
            {buyerTransactions.length > 0 && (
              <div className="px-1">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">You're Buying</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 animate-fade-up">
              <StatCard icon={Clock} value={buyerPending} label="Pending" variant="warning" />
              <StatCard icon={TrendingUp} value={buyerActive} label="Active" variant="ocean" />
              <StatCard icon={CheckCircle} value={buyerCompleted} label="Done" variant="primary" />
            </div>

            {renderTransactionList(
              buyerTransactions,
              "No purchases yet",
              "You haven't made any protected payments yet.",
              "buyer"
            )}
          </TabsContent>

          {/* SELLER TAB (only for BUYER_SELLER role) */}
          {!isAdmin && !isAgent && (
            <TabsContent value="seller" className="space-y-5">
              {sellerTransactions.length > 0 && isVerifiedSeller && (
                <div className="px-1">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">You're Selling</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 animate-fade-up">
                <StatCard icon={Clock} value={sellerPending} label="Pending" variant="warning" />
                <StatCard icon={TrendingUp} value={sellerActive} label="Active" variant="ocean" />
                <StatCard icon={CheckCircle} value={sellerCompleted} label="Done" variant="primary" />
              </div>

              {isVerifiedSeller ? (
                <>
                  {renderTransactionList(
                    sellerTransactions,
                    "No sales yet",
                    "Share your listing link to receive protected payments.",
                    "seller"
                  )}
                  {sellerTransactions.length === 0 && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4">
                      <Share2 className="w-4 h-4" />
                      <span>Share your listings to start receiving payments</span>
                    </div>
                  )}
                </>
              ) : (
                <GlassCard className="text-center py-16">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-muted to-muted/30 mx-auto mb-4 flex items-center justify-center">
                    <Store className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <p className="font-bold text-foreground">Seller access required</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Verify your account to receive protected payments
                  </p>
                </GlassCard>
              )}
            </TabsContent>
          )}
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}

interface TransactionCardProps {
  transaction: Transaction;
  role: "buyer" | "seller" | "admin" | "agent";
  agents: User[];
  onMarkAtHub: (id: string) => void;
  onAssignAgent: (id: string, agentId: string) => void;
  onAgentDelivered: (id: string) => void;
  onClick: () => void;
  isCompleted?: boolean;
}

function TransactionCard({ 
  transaction, 
  role, 
  agents,
  onMarkAtHub,
  onAssignAgent,
  onAgentDelivered,
  onClick, 
  isCompleted 
}: TransactionCardProps) {
  const navigate = useNavigate();
  const StatusIcon = statusIcons[transaction.status] || Clock;
  const hasInvoice = transaction.invoice != null;

  const handleInvoiceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/invoice/${transaction.id}`);
  };

  const showAdminActions = role === "admin" && !isCompleted;
  const showAgentActions = role === "agent" && transaction.status === "out_for_delivery";

  return (
    <GlassCard
      variant="interactive"
      className={`p-4 ${isCompleted ? "opacity-70" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
          isCompleted 
            ? "bg-gradient-to-br from-primary/15 to-primary/5" 
            : "bg-gradient-to-br from-ocean/15 to-ocean/5"
        }`}>
          <StatusIcon className={`w-6 h-6 ${isCompleted ? "text-primary" : "text-ocean"}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">
            {transaction.productName}
          </p>
          
          {/* Show buyer/seller info based on role */}
          {(role === "seller" || role === "admin" || role === "agent") && transaction.buyerName && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <UserIcon className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{transaction.buyerName}</span>
              {transaction.buyerCity && <span className="text-xs">• {transaction.buyerCity}</span>}
            </div>
          )}
          {role === "buyer" && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <Store className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{transaction.sellerName}</span>
            </div>
          )}
          
          {/* Admin: Show assigned agent */}
          {role === "admin" && transaction.assignedAgentName && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-teal-600">
              <UserCheck className="w-3 h-3" />
              <span>Agent: {transaction.assignedAgentName}</span>
            </div>
          )}
          
          {/* Invoice link */}
          {hasInvoice && (
            <button
              onClick={handleInvoiceClick}
              className="flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
            >
              <FileText className="w-3 h-3" />
              Invoice
            </button>
          )}
        </div>

        {/* Price & Status */}
        <div className="text-right shrink-0">
          <p className="font-bold text-foreground">
            {formatPriceXAF(transaction.price)}
          </p>
          <StatusBadge variant={statusVariants[transaction.status] || "pending_setup"} className="mt-1.5">
            {statusLabels[transaction.status] || "Processing"}
          </StatusBadge>
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 self-center" />
      </div>

      {/* Admin Actions */}
      {showAdminActions && (
        <div className="mt-4 pt-4 border-t border-border/50 space-y-3" onClick={e => e.stopPropagation()}>
          {transaction.status === "in_transit_to_hub" && (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => onMarkAtHub(transaction.id)}
            >
              <Warehouse className="w-4 h-4" />
              Mark Received at Hub
            </Button>
          )}
          
          {transaction.status === "at_prolist_hub" && agents.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Assign Delivery Agent</label>
              <Select onValueChange={(agentId) => onAssignAgent(transaction.id, agentId)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select agent..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} ({agent.city})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Agent Actions */}
      {showAgentActions && (
        <div className="mt-4 pt-4 border-t border-border/50 space-y-2" onClick={e => e.stopPropagation()}>
          <p className="text-xs font-medium text-muted-foreground mb-2">Confirm Delivery</p>
          <div className="grid grid-cols-3 gap-2">
            <Button size="sm" variant="outline" className="gap-1 text-xs">
              <QrCode className="w-3 h-3" />
              Show QR
            </Button>
            <Button size="sm" variant="outline" className="gap-1 text-xs">
              <QrCode className="w-3 h-3" />
              Scan QR
            </Button>
            <Button 
              size="sm" 
              variant="default" 
              className="gap-1 text-xs"
              onClick={() => onAgentDelivered(transaction.id)}
            >
              <KeyRound className="w-3 h-3" />
              OTP
            </Button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}