import { Post } from "@/types/listing";
import { formatPriceXAF } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Share2, Edit3, Package, Shield, Calendar } from "lucide-react";
import { toast } from "sonner";

interface ListingDetailSheetProps {
  listing: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (listing: Post) => void;
}

export function ListingDetailSheet({ 
  listing, 
  open, 
  onOpenChange,
  onEdit 
}: ListingDetailSheetProps) {
  if (!listing) return null;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/p/${listing.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: listing.description || `Check out ${listing.title}`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Image Section */}
          <div className="relative w-full aspect-square bg-muted flex-shrink-0">
            {listing.imageUrl ? (
              <img 
                src={listing.imageUrl} 
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground" strokeWidth={1} />
              </div>
            )}
            
            {/* Price Badge */}
            <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
              <p className="text-lg font-bold text-foreground">
                {formatPriceXAF(listing.price)}
              </p>
            </div>

            {/* Protection Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Shield className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2} />
              <span className="text-xs font-semibold text-primary-foreground">Protected</span>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 overflow-y-auto p-5">
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-xl font-bold text-foreground leading-tight">
                {listing.title}
              </SheetTitle>
            </SheetHeader>

            {/* Category & Status */}
            <div className="flex items-center gap-2 mb-4">
              {listing.category && (
                <span className="px-2.5 py-1 bg-muted rounded-md text-xs font-medium text-muted-foreground capitalize">
                  {listing.category}
                </span>
              )}
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                listing.isActive 
                  ? "bg-success/10 text-success" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {listing.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Description */}
            {listing.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {listing.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Created {formatDate(listing.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 p-5 pt-0 pb-8 space-y-3">
            <Button 
              onClick={handleShare}
              className="w-full h-12 rounded-xl text-sm font-semibold"
            >
              <Share2 className="w-4 h-4 mr-2" strokeWidth={2} />
              Share Listing
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onEdit(listing);
              }}
              className="w-full h-12 rounded-xl text-sm font-semibold"
            >
              <Edit3 className="w-4 h-4 mr-2" strokeWidth={2} />
              Edit Listing
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
