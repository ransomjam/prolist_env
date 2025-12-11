import { cn } from "@/lib/utils";
import { Post } from "@/types/listing";
import { Lock, Package } from "lucide-react";

interface PostPreviewCardProps {
  post: Post;
  onClick?: () => void;
  className?: string;
}

export function PostPreviewCard({ post, onClick, className }: PostPreviewCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white/80 border border-white/40 rounded-2xl backdrop-blur-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-card",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-accent/30 flex items-center justify-center">
            <Package className="w-12 h-12 text-muted" />
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-2 left-2 bg-foreground/90 text-white px-2 py-1 rounded-lg text-sm font-semibold">
          {formatPrice(post.price)}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
        {post.description && (
          <p className="text-xs text-muted mt-1 line-clamp-2">{post.description}</p>
        )}
        
        {/* Protection Badge */}
        <div className="flex items-center gap-1 mt-2 text-2xs text-primary">
          <Lock className="w-3 h-3" />
          <span className="font-medium">Protected by ProList</span>
        </div>
      </div>
    </div>
  );
}
