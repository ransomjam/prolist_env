import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Package, Truck, UserCog, CheckCircle, ArrowRight, Info, BookOpen, Star, Lock, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { getBuyerTransactions } from "@/lib/supabaseStorage";
import { Transaction } from "@/types/database";

export default function Home() {
  const navigate = useNavigate();
  const { authUser, loading } = useAuth();
  const [assignedDeliveries, setAssignedDeliveries] = useState(0);
  const [pendingConfirmation, setPendingConfirmation] = useState<Transaction | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const userRole = authUser?.primaryRole || "BUYER";
  const isAdmin = userRole === "ADMIN";
  const isAgent = userRole === "AGENT";
  const isVerifiedSeller = authUser?.isVerified;

  useEffect(() => {
    if (!loading && !authUser) {
      navigate("/auth/login");
      return;
    }

    const loadData = async () => {
      if (!authUser) return;
      
      try {
        // Load buyer's transactions to check for pending confirmations
        const transactions = await getBuyerTransactions(authUser.id);
        const pending = transactions.find(t => t.status === 'DELIVERED_AWAITING_CONFIRMATION');
        setPendingConfirmation(pending || null);
        
        // Count assigned deliveries for agents
        if (isAgent) {
          const assigned = transactions.filter(t => 
            t.assigned_agent_id === authUser.id && 
            t.status === "OUT_FOR_DELIVERY"
          );
          setAssignedDeliveries(assigned.length);
        }
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (authUser) {
      loadData();
    }
  }, [navigate, authUser, loading, isAgent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar title="ProList Protect" showLogo />

      <main className="p-4 space-y-4">
        {/* Buyer Action Required Banner */}
        {pendingConfirmation && !isAdmin && !isAgent && (
          <div 
            onClick={() => navigate(`/confirm/${pendingConfirmation.id}`)}
            className="bg-gradient-to-r from-ocean to-primary p-4 rounded-lg shadow-sm cursor-pointer animate-fade-up"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-semibold text-white">Confirm Delivery</p>
                  <p className="text-sm text-white/80">Your item has been delivered</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* Admin Mode Banner */}
        {isAdmin && (
          <div className="bg-card border border-border/60 rounded-lg p-5 shadow-sm animate-fade-up">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-ocean/10 flex items-center justify-center flex-shrink-0">
                <UserCog className="w-6 h-6 text-ocean" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">Admin Dashboard</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage hub operations and assign agents
                </p>
              </div>
            </div>
            <Button 
              size="lg" 
              onClick={() => navigate("/payments")} 
              className="mt-4 w-full h-11 rounded-lg font-semibold"
            >
              <Package className="w-4 h-4 mr-2" strokeWidth={1.5} />
              View All Orders
            </Button>
          </div>
        )}

        {/* Agent Mode Banner */}
        {isAgent && (
          <div className="bg-card border border-border/60 rounded-lg p-5 shadow-sm animate-fade-up">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-teal" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">Delivery Agent</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {assignedDeliveries > 0 
                    ? `You have ${assignedDeliveries} assigned ${assignedDeliveries === 1 ? 'delivery' : 'deliveries'} today.`
                    : "No deliveries assigned yet."}
                </p>
              </div>
            </div>
            <Button 
              size="lg" 
              onClick={() => navigate("/payments")} 
              className="mt-4 w-full h-11 rounded-lg font-semibold"
            >
              <Package className="w-4 h-4 mr-2" strokeWidth={1.5} />
              View My Deliveries
            </Button>
          </div>
        )}

        {/* Escrow Protection Feature Banner */}
        {!isAdmin && !isAgent && (
          <div className="bg-gradient-to-br from-ocean via-teal to-primary p-5 rounded-lg shadow-sm animate-fade-up">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">Escrow Protection</h2>
                <p className="text-sm text-white/80 mt-1">
                  Your payment is held securely until you confirm receipt of your item.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* How It Works Section */}
        {!isAdmin && !isAgent && (
          <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
            <h2 className="text-sm font-semibold text-foreground mb-3">How ProList Works</h2>
            <div className="space-y-2">
              <div className="bg-card border border-border/60 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-ocean/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-ocean">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Seller Lists Item</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Verified sellers create listings with escrow protection</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card border border-border/60 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-teal">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Buyer Pays Securely</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Payment is held in escrow until delivery is confirmed</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card border border-border/60 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Confirm & Release</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Buyer confirms delivery, seller receives payment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification CTA for unverified sellers */}
        {!isAdmin && !isAgent && !isVerifiedSeller && (
          <div 
            className="bg-card border border-border/60 rounded-lg p-4 shadow-sm animate-fade-up cursor-pointer"
            style={{ animationDelay: "0.1s" }}
            onClick={() => navigate("/verify")}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-warning" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">Become a Verified Seller</p>
                <p className="text-xs text-muted-foreground mt-0.5">Complete verification to start selling</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
          </div>
        )}

        {/* Tips & Trust Section */}
        {!isAdmin && !isAgent && (
          <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <h2 className="text-sm font-semibold text-foreground mb-3">Build Trust</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-card border border-border/60 rounded-lg p-4 shadow-sm">
                <Lock className="w-5 h-5 text-ocean mb-2" strokeWidth={1.5} />
                <p className="font-medium text-foreground text-sm">Secure Payments</p>
                <p className="text-xs text-muted-foreground mt-1">All transactions protected</p>
              </div>
              <div className="bg-card border border-border/60 rounded-lg p-4 shadow-sm">
                <Star className="w-5 h-5 text-warning mb-2" strokeWidth={1.5} />
                <p className="font-medium text-foreground text-sm">Verified Sellers</p>
                <p className="text-xs text-muted-foreground mt-1">Identity confirmed</p>
              </div>
              <div className="bg-card border border-border/60 rounded-lg p-4 shadow-sm">
                <CreditCard className="w-5 h-5 text-teal mb-2" strokeWidth={1.5} />
                <p className="font-medium text-foreground text-sm">Easy Payouts</p>
                <p className="text-xs text-muted-foreground mt-1">Fast seller payments</p>
              </div>
              <div className="bg-card border border-border/60 rounded-lg p-4 shadow-sm">
                <Truck className="w-5 h-5 text-primary mb-2" strokeWidth={1.5} />
                <p className="font-medium text-foreground text-sm">Safe Delivery</p>
                <p className="text-xs text-muted-foreground mt-1">Tracked handoffs</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Start for Verified Sellers */}
        {!isAdmin && !isAgent && isVerifiedSeller && (
          <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate("/posts/new")} 
                className="w-full h-11 rounded-lg font-semibold justify-start"
              >
                <Package className="w-4 h-4 mr-3" strokeWidth={1.5} />
                Create New Listing
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/profile")} 
                className="w-full h-11 rounded-lg font-medium justify-start"
              >
                <BookOpen className="w-4 h-4 mr-3" strokeWidth={1.5} />
                View My Listings
              </Button>
            </div>
          </div>
        )}

        {/* Educational Content */}
        {!isAdmin && !isAgent && (
          <div className="animate-fade-up" style={{ animationDelay: "0.25s" }}>
            <h2 className="text-sm font-semibold text-foreground mb-3">Learn More</h2>
            <div className="bg-card border border-border/60 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-ocean/10 flex items-center justify-center">
                  <Info className="w-5 h-5 text-ocean" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">Seller FAQ</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Common questions answered</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}
