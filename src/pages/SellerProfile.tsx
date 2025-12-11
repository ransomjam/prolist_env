import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getUserById, getSellerPosts, formatPriceXAF } from "@/lib/storage";
import { User as UserType } from "@/types/transaction";
import { Listing } from "@/types/listing";
import { User, MapPin, Shield, Package, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SellerProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<UserType | null>(null);
  const [posts, setPosts] = useState<Listing[]>([]);

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    const user = getUserById(userId);
    if (!user) {
      navigate("/");
      return;
    }

    setSeller(user);
    setPosts(getSellerPosts(userId));
  }, [userId, navigate]);

  const isVerified = seller?.isVerified || seller?.verificationStatus === "VERIFIED";

  if (!seller) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg p-4 safe-top safe-bottom">
      <div className="max-w-md mx-auto space-y-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Seller Info */}
        <GlassCard variant="elevated" className="animate-fade-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-teal to-blue flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground text-lg">{seller.name}</p>
                {isVerified && (
                  <StatusBadge variant="escrow" icon={false}>
                    Verified
                  </StatusBadge>
                )}
              </div>
              {seller.city && (
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-muted" />
                  <span className="text-sm text-muted">{seller.city}</span>
                </div>
              )}
              {isVerified && (
                <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                  <Shield className="w-3 h-3" />
                  <span className="font-medium">Verified Seller</span>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Seller Stats */}
        <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <GlassCard className="text-center py-4">
            <p className="text-2xl font-bold text-foreground">{posts.length}</p>
            <p className="text-xs text-muted">Posts</p>
          </GlassCard>
          <GlassCard className="text-center py-4">
            <p className="text-2xl font-bold text-foreground">
              {isVerified ? "✓" : "—"}
            </p>
            <p className="text-xs text-muted">Verified</p>
          </GlassCard>
        </div>

        {/* Seller's Posts */}
        <section className="space-y-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-sm font-semibold text-foreground px-1">
            Posts ({posts.length})
          </h3>
          {posts.length === 0 ? (
            <GlassCard className="text-center py-8">
              <Package className="w-12 h-12 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">No posts yet</p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <GlassCard
                  key={post.id}
                  className="cursor-pointer hover:shadow-card transition-shadow"
                  onClick={() => navigate(`/p/${post.id}`)}
                >
                  <div className="flex items-center gap-3">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-accent/30 flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{post.title}</p>
                      <p className="text-sm font-semibold text-primary">{formatPriceXAF(post.price)}</p>
                      {post.description && (
                        <p className="text-xs text-muted truncate mt-0.5">{post.description}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted" />
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
