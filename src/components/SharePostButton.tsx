import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Post } from "@/types/listing";
import { sharePost } from "@/lib/shareImage";
import { toast } from "sonner";
import { ImageIcon, Loader2 } from "lucide-react";

interface SharePostButtonProps {
  post: Post;
  isVerified?: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "full";
  className?: string;
  label?: string;
  onBeforeShare?: () => void | Promise<void>;
}

export function SharePostButton({ 
  post, 
  isVerified = false, 
  variant = "outline",
  size = "default",
  className = "",
  label,
  onBeforeShare
}: SharePostButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    setIsLoading(true);
    try {
      if (onBeforeShare) {
        await onBeforeShare();
      }
      await sharePost(post, isVerified);
      toast.success("Ready! Image shared & caption copied ✔");
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Failed to share. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const buttonLabel = label || "Share as Image";

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={isLoading}
      className={`gap-2 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <ImageIcon className="w-4 h-4" />
      )}
      {isLoading ? "Generating..." : buttonLabel}
    </Button>
  );
}
