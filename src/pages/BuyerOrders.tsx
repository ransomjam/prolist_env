import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { Card3D } from "@/components/ui/Card3D";
import { Icon3D } from "@/components/ui/Icon3D";
import { StatusOrb3D } from "@/components/ui/StatusOrb3D";
import { useAuth } from "@/hooks/useAuth";
import { getBuyerTransactions, formatPriceXAF } from "@/lib/supabaseStorage";
import { Transaction, TransactionStatus } from "@/types/database";
import { Package, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";

const statusLabels: Record<TransactionStatus, string> = {
  PENDING_PAYMENT: "Awaiting Payment",
  ESCROW_HELD: "Payment Secured",
  IN_TRANSIT_TO_HUB: "Shipped to Hub",
  AT_PROLIST_HUB: "At Hub",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED_AWAITING_CONFIRMATION: "Ready to Confirm",
  COMPLETED: "Completed",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

const getStatusType = (status: TransactionStatus): "pending" | "active" | "transit" | "success" | "warning" => {
  if (status === "COMPLETED") return "success";
  if (status === "REFUNDED" || status === "CANCELLED") return "warning";
  if (["IN_TRANSIT_TO_HUB", "OUT_FOR_DELIVERY"].includes(status)) return "transit";
  if (["ESCROW_HELD", "AT_PROLIST_HUB", "DELIVERED_AWAITING_CONFIRMATION"].includes(status)) return "active";
  return "pending";
};

export default function BuyerOrders() {
  const navigate = useNavigate();
  const { authUser, loading } = useAuth();
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    if (!authUser) {
      navigate("/auth/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const transactions = await getBuyerTransactions(authUser.id);
        setOrders(transactions);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchOrders();
  }, [authUser, loading, navigate]);

  const activeOrders = orders.filter((t) => t.status !== "COMPLETED" && t.status !== "REFUNDED" && t.status !== "CANCELLED");
  const completedOrders = orders.filter((t) => t.status === "COMPLETED" || t.status === "REFUNDED" || t.status === "CANCELLED");

  if (loading || isFetching) {
    return (
      <div className="min-h-screen page-premium flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-premium pb-8">
      <TopBar title="My Orders" showBack />

      <main className="relative z-10 p-4 space-y-6">
        {activeOrders.length > 0 && (
          <section className="space-y-4 animate-fade-up">
            <h3 className="text-sm font-bold text-foreground px-1">Active Orders</h3>
            <div className="space-y-4">
              {activeOrders.map((order, index) => (
                <Card3D
                  key={order.id}
                  variant="interactive"
                  className="p-5"
                  onClick={() => navigate(`/track/${order.id}`)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    <StatusOrb3D status={getStatusType(order.status)} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">
                        {order.post?.title || "Order"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {order.seller?.name || "Seller"}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-ocean/10 text-ocean">
                        {statusLabels[order.status]}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground text-lg">
                        {formatPriceXAF(order.amount)}
                      </p>
                      <ArrowRight className="w-4 h-4 text-muted-foreground mt-3 ml-auto" />
                    </div>
                  </div>
                </Card3D>
              ))}
            </div>
          </section>
        )}

        {completedOrders.length > 0 && (
          <section className="space-y-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-sm font-bold text-foreground px-1">Completed</h3>
            <div className="space-y-4">
              {completedOrders.map((order, index) => (
                <Card3D
                  key={order.id}
                  className="p-5 opacity-80"
                  onClick={() => navigate(`/track/${order.id}`)}
                  style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    <StatusOrb3D 
                      status={order.status === "REFUNDED" || order.status === "CANCELLED" ? "warning" : "success"} 
                      size="md" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {order.post?.title || "Order"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {formatPriceXAF(order.amount)}
                      </p>
                      <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        order.status === "REFUNDED" || order.status === "CANCELLED"
                          ? "bg-warning/10 text-warning" 
                          : "bg-primary/10 text-primary"
                      }`}>
                        {order.status === "REFUNDED" ? "Refunded" : order.status === "CANCELLED" ? "Cancelled" : "Completed"}
                      </div>
                    </div>
                  </div>
                </Card3D>
              ))}
            </div>
          </section>
        )}

        {/* Empty State with 3D */}
        {orders.length === 0 && (
          <Card3D className="text-center py-16 animate-fade-up">
            <Icon3D icon={ShoppingBag} size="2xl" variant="muted" className="mx-auto mb-6" float />
            <p className="font-bold text-foreground text-lg">No orders yet</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              Your purchases will appear here once you buy something
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-ocean">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Start exploring products</span>
            </div>
          </Card3D>
        )}
      </main>
    </div>
  );
}