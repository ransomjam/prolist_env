import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { SharePostButton } from "@/components/SharePostButton";
import { useAuth } from "@/hooks/useAuth";
import { getPost, formatPriceXAF } from "@/lib/supabaseStorage";
import { Post } from "@/types/database";
import { toast } from "sonner";
import {
  CheckCircle,
  Copy,
  ArrowRight,
  Edit,
  ExternalLink,
} from "lucide-react";

export default function ListingSuccess() {
  const { listingId, postId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const [listing, setListing] = useState<Post | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const id = listingId || postId;
    if (!id) {
      navigate("/home");
      return;
    }

    const fetchListing = async () => {
      try {
        const l = await getPost(id);
        if (!l) {
          toast.error("Listing not found");
          navigate("/home");
          return;
        }
        setListing(l);
      } catch (error) {
        console.error("Error fetching listing:", error);
        toast.error("Failed to load listing");
        navigate("/home");
      } finally {
        setIsFetching(false);
      }
    };

    fetchListing();
  }, [listingId, postId, navigate]);

  const getListingUrl = () => {
    return `${window.location.origin}/p/${listing?.id}`;
  };

  const getShareDescription = () => {
    const price = formatPriceXAF(listing?.price || 0);
    let text = `${listing?.title} - ${price}`;
    if (listing?.description) {
      text += `\n\n${listing.description}`;
    }
    text += `\n\n${getListingUrl()}`;
    return text;
  };

  const copyDescription = async () => {
    try {
      await navigator.clipboard.writeText(getShareDescription());
      setCopied(true);
      toast.success("Description copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Check if seller is verified
  const isVerifiedSeller = authUser?.profile?.verification_status === "VERIFIED";

  // Convert to old post format for SharePostButton
  const postForShare = listing ? {
    id: listing.id,
    title: listing.title,
    description: listing.description || "",
    price: listing.price,
    imageUrl: listing.image_url || undefined,
    sellerId: listing.seller_id,
    sellerName: authUser?.profile?.name || "Seller",
    sellerPhone: authUser?.profile?.phone || "",
    createdAt: listing.created_at,
    updatedAt: listing.updated_at,
    isActive: true,
  } : null;

  if (isFetching) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  return (
    <div className="min-h-screen aurora-bg">
      <TopBar title="Listing Created" />

      <main className="p-4 pb-8 space-y-4">
        {/* Success Header */}
        <div className="text-center py-5 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary via-teal to-blue shadow-glow mb-3">
            <CheckCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Listing Created!</h1>
          <p className="text-sm text-foreground mt-1 px-6">
            Sell With Confidence, Your Customers Now Know Your Products are Authentic
          </p>
        </div>

        {/* Listing Preview */}
        <GlassCard variant="elevated" className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          {listing.image_url && (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="w-full h-40 object-cover rounded-xl mb-4"
            />
          )}
          <h2 className="font-semibold text-foreground text-lg">{listing.title}</h2>
          <p className="text-2xl font-bold text-gradient mt-1">{formatPriceXAF(listing.price)}</p>
          
          {/* Description with link */}
          <div className="mt-3 p-3 bg-muted/30 rounded-xl">
            <p className="text-sm text-foreground whitespace-pre-line">
              {listing.description || "No description provided"}
            </p>
            <p className="text-xs text-ocean mt-2 truncate">{getListingUrl()}</p>
          </div>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={copyDescription}
            className="mt-2 text-muted-foreground gap-2"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Description"}
          </Button>
        </GlassCard>

        {/* Share as Image - Premium Feature */}
        <GlassCard className="space-y-3 animate-fade-up bg-gradient-to-br from-primary/5 to-ocean/5 border-primary/20" style={{ animationDelay: "0.12s" }}>
          <div className="flex gap-2">
            {postForShare && (
              <SharePostButton 
                post={postForShare} 
                isVerified={isVerifiedSeller}
                variant="default"
                size="full"
                className="flex-1 bg-gradient-to-r from-primary to-ocean text-white rounded-2xl h-12"
                label="Share Now!"
              />
            )}
            <Button
              variant="outline"
              onClick={() => navigate(`/posts/${listing.id}/edit`)}
              className="h-12 rounded-2xl px-4"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </GlassCard>

        {/* Actions */}
        <div className="space-y-2 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <Button
            variant="outline"
            size="full"
            onClick={() => navigate(`/p/${listing.id}`)}
            className="gap-2 rounded-xl"
          >
            <ExternalLink className="w-4 h-4" />
            View your Product (How customers see it)
          </Button>

          <Button size="full" onClick={() => navigate("/home")} className="gap-2 rounded-xl">
            Go to Home
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}