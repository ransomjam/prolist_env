import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { ListingDetailSheet } from "@/components/ListingDetailSheet";
import { ProfileSettingsSheet } from "@/components/ProfileSettingsSheet";
import { useAuth } from "@/hooks/useAuth";
import { getSellerPosts, getSellerTransactions, formatPriceXAF } from "@/lib/supabaseStorage";
import { Post } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  Package,
  LogOut,
  ChevronRight,
  Truck,
  UserCog,
  User,
  Settings,
  Wallet,
  Users,
  Plus,
  Loader2,
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { authUser, loading, signOut, refreshProfile } = useAuth();
  
  const [listings, setListings] = useState<Post[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    completed: 0,
    active: 0,
    pending: 0,
    revenue: 0,
    views: 0,
  });
  const [selectedListing, setSelectedListing] = useState<Post | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !authUser) {
      navigate("/auth/login");
      return;
    }

    const loadProfileData = async () => {
      if (!authUser) return;
      
      try {
        // Fetch seller's posts
        const posts = await getSellerPosts(authUser.id);
        setListings(posts);

        // Fetch seller's transactions for stats
        const transactions = await getSellerTransactions(authUser.id);
        const completedTx = transactions.filter((t) => t.status === "COMPLETED");
        const totalRevenue = completedTx.reduce((sum, t) => sum + (t.amount || 0), 0);
        
        setStats({
          totalSales: transactions.length,
          completed: completedTx.length,
          active: transactions.filter((t) => !["COMPLETED", "REFUNDED", "CANCELLED"].includes(t.status)).length,
          pending: transactions.filter((t) => t.status === "PENDING_PAYMENT").length,
          revenue: totalRevenue,
          views: 0, // Would need analytics to track this
        });
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (authUser) {
      loadProfileData();
    }
  }, [navigate, authUser, loading]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/auth/login");
  };

  const isVerified = authUser?.isVerified;
  const userRole = authUser?.primaryRole || "BUYER";
  const isAdmin = userRole === "ADMIN";
  const isAgent = userRole === "AGENT";

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

  const profile = authUser.profile;

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar title="My Account" />

      <main className="p-4 space-y-4">
        {/* Profile Identity Card */}
        <div className="bg-card border border-border/60 rounded-lg p-5 shadow-sm animate-fade-up">
          <div className="flex items-start gap-4">
            {/* Profile Photo */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-ocean via-teal to-primary flex items-center justify-center flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-white" strokeWidth={1.5} />
              )}
            </div>

            {/* Identity Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">
                {profile?.name || "ProList User"}
              </h1>

              {/* Contact */}
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{profile?.phone || "+237 6XX XXX XXX"}</span>
              </div>

              {/* Verification Badge */}
              {isVerified && !isAdmin && !isAgent && (
                <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-ocean to-primary text-white">
                  <ShieldCheck className="w-3 h-3" strokeWidth={2} />
                  <span>Verified Seller</span>
                </div>
              )}

              {isAdmin && (
                <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-ocean/10 text-ocean">
                  <UserCog className="w-3 h-3" strokeWidth={2} />
                  <span>Admin</span>
                </div>
              )}

              {isAgent && (
                <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal/10 text-teal">
                  <Truck className="w-3 h-3" strokeWidth={2} />
                  <span>Delivery Agent</span>
                </div>
              )}

              {/* Location */}
              {profile?.city && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" strokeWidth={1.5} />
                  <span>{profile.city}, Cameroon</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full h-9 rounded-lg text-sm font-medium"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Verification CTA for non-verified */}
        {!isVerified && !isAdmin && !isAgent && (
          <div 
            className="bg-card border border-border/60 rounded-lg p-4 shadow-sm animate-fade-up cursor-pointer"
            style={{ animationDelay: "0.05s" }}
            onClick={() => navigate("/verify")}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
                <Shield className="w-4.5 h-4.5 text-warning" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">
                  {profile?.verification_status === "PENDING" ? "Verification Pending" 
                   : profile?.verification_status === "REJECTED" ? "Verification Rejected"
                   : "Verify Your Account"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {profile?.verification_status === "PENDING" ? "We're reviewing your documents" 
                   : "Start selling with trusted verification"}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
          </div>
        )}

        {/* Seller Stats Grid */}
        {isVerified && !isAdmin && !isAgent && (
          <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-sm font-semibold text-foreground mb-2">Seller Stats</h2>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-card border border-border/60 rounded-lg p-3 shadow-sm text-center">
                <p className="text-xl font-bold text-foreground">{stats.totalSales}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Sales</p>
              </div>
              <div className="bg-card border border-border/60 rounded-lg p-3 shadow-sm text-center">
                <p className="text-xl font-bold text-foreground">{stats.active}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Active</p>
              </div>
              <div className="bg-card border border-border/60 rounded-lg p-3 shadow-sm text-center">
                <p className="text-xl font-bold text-foreground">{stats.completed}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
              </div>
              <div className="bg-card border border-border/60 rounded-lg p-3 shadow-sm text-center">
                <p className="text-xl font-bold text-foreground">{stats.pending}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pending</p>
              </div>
              <div className="bg-card border border-border/60 rounded-lg p-3 shadow-sm text-center">
                <p className="text-xl font-bold text-foreground">{(stats.revenue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground mt-0.5">Revenue</p>
              </div>
              <div className="bg-card border border-border/60 rounded-lg p-3 shadow-sm text-center">
                <p className="text-xl font-bold text-foreground">{stats.views}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Views</p>
              </div>
            </div>
          </div>
        )}

        {/* My Listings Section */}
        {isVerified && !isAdmin && !isAgent && (
          <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-foreground">My Listings</h2>
              {listings.length > 6 && (
                <button className="text-xs font-medium text-ocean hover:underline">
                  View All
                </button>
              )}
            </div>
            
            {isLoadingData ? (
              <div className="bg-card border border-border/60 rounded-lg p-6 shadow-sm text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-card border border-border/60 rounded-lg p-6 shadow-sm text-center">
                <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <p className="font-semibold text-foreground text-sm">You have no listings yet</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Create your first listing to appear here</p>
                <Button 
                  onClick={() => navigate("/posts/new")}
                  className="h-9 rounded-lg text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Create Listing
                </Button>
                <button className="block w-full text-xs text-muted-foreground mt-3 hover:text-foreground transition-colors">
                  Learn how selling works
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {listings.slice(0, 6).map((listing) => (
                  <div 
                    key={listing.id}
                    className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer group"
                    onClick={() => {
                      setSelectedListing(listing);
                      setSheetOpen(true);
                    }}
                  >
                    {listing.image_url ? (
                      <img 
                        src={listing.image_url} 
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Package className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-xs font-semibold text-white truncate">
                        {formatPriceXAF(listing.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-sm font-semibold text-foreground mb-2">Quick Actions</h2>
          
          <div
            className="bg-card border border-border/60 rounded-lg p-4 shadow-sm cursor-pointer hover:border-border transition-colors"
            onClick={() => navigate("/payments")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-ocean/10 flex items-center justify-center">
                  <Package className="w-4.5 h-4.5 text-ocean" strokeWidth={1.5} />
                </div>
                <span className="font-medium text-foreground text-sm">My Orders</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
          </div>

          <div
            className="bg-card border border-border/60 rounded-lg p-4 shadow-sm cursor-pointer hover:border-border transition-colors"
            onClick={() => navigate("/payments")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-4.5 h-4.5 text-primary" strokeWidth={1.5} />
                </div>
                <span className="font-medium text-foreground text-sm">Wallet & Payouts</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
          </div>

          {!isAdmin && !isAgent && (
            <div className="bg-card border border-border/60 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Users className="w-4.5 h-4.5 text-warning" strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="font-medium text-foreground text-sm">Referral Rewards</span>
                    <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Soon</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          size="lg"
          onClick={handleLogout}
          className="w-full text-destructive hover:text-destructive hover:border-destructive/40 animate-fade-up rounded-lg h-10 mt-2"
          style={{ animationDelay: "0.25s" }}
        >
          <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Log Out
        </Button>
      </main>

      <BottomNav />

      {/* Listing Detail Sheet - now uses DB types */}
      {/* TODO: Update ListingDetailSheet to use new Post type */}

      {/* Profile Settings Sheet */}
      {/* TODO: Update ProfileSettingsSheet to use new Profile type */}
    </div>
  );
}
