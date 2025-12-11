import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card3D } from "@/components/ui/Card3D";
import { Icon3D } from "@/components/ui/Icon3D";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AICaptionAssist } from "@/components/AICaptionAssist";
import { SharePostButton } from "@/components/SharePostButton";
import { useAuth } from "@/hooks/useAuth";
import { getPost, updatePost, uploadPostImage } from "@/lib/supabaseStorage";
import { LISTING_CATEGORIES } from "@/types/listing";
import { Post } from "@/types/database";
import { toast } from "sonner";
import { Save, Package, Tag, X, Camera, ImagePlus } from "lucide-react";

export default function EditListing() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const { authUser, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [listing, setListing] = useState<Post | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
  });

  const isVerified = authUser?.profile?.verification_status === "VERIFIED";

  useEffect(() => {
    if (loading) return;
    
    if (!authUser) {
      navigate("/auth/login");
      return;
    }

    if (!postId) {
      toast.error("Listing not found");
      navigate("/profile");
      return;
    }

    const fetchListing = async () => {
      try {
        const existingListing = await getPost(postId);
        if (!existingListing) {
          toast.error("Listing not found");
          navigate("/profile");
          return;
        }

        // Check ownership
        if (existingListing.seller_id !== authUser.id) {
          toast.error("You don't have permission to edit this listing");
          navigate("/profile");
          return;
        }

        setListing(existingListing);
        setImagePreview(existingListing.image_url || null);
        setFormData({
          title: existingListing.title || "",
          description: existingListing.description || "",
          price: existingListing.price?.toString() || "",
          category: existingListing.category || "",
          condition: existingListing.condition || "",
        });
      } catch (error) {
        console.error("Error fetching listing:", error);
        toast.error("Failed to load listing");
        navigate("/profile");
      } finally {
        setIsFetching(false);
      }
    };

    fetchListing();
  }, [authUser, loading, postId, navigate]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a product title");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (!listing || !authUser) return;

    setIsLoading(true);

    try {
      // Upload new image if selected
      let imageUrl = imagePreview;
      if (imageFile) {
        imageUrl = await uploadPostImage(authUser.id, imageFile);
      }

      const updatedListing = await updatePost(listing.id, {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        category: formData.category || null,
        condition: formData.condition || null,
        image_url: imageUrl || null,
      });

      if (updatedListing) {
        setListing(updatedListing);
        toast.success("Listing updated successfully!");
      }
    } catch (error) {
      console.error("Error updating listing:", error);
      toast.error("Failed to update listing");
    } finally {
      setIsLoading(false);
    }
  };

  // Build current post object for sharing
  const currentPost = listing ? {
    id: listing.id,
    title: formData.title.trim(),
    description: formData.description.trim(),
    price: parseFloat(formData.price) || 0,
    imageUrl: imagePreview || undefined,
    sellerId: listing.seller_id,
    sellerName: authUser?.profile?.name || "Seller",
    sellerPhone: authUser?.profile?.phone || "",
    createdAt: listing.created_at,
    updatedAt: listing.updated_at,
    isActive: true,
  } : null;

  if (loading || isFetching) {
    return (
      <div className="min-h-screen page-premium flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  return (
    <div className="min-h-screen page-premium pb-24">
      <TopBar title="Edit Listing" showBack />

      <main className="relative z-10 p-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 3D Image Upload Panel */}
          <Card3D variant="elevated" className="animate-fade-up overflow-hidden">
            <div className="flex items-center gap-3 text-sm font-bold text-foreground mb-3">
              <Icon3D icon={Camera} size="sm" variant="brand" />
              <span>Product Image</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            {imagePreview ? (
              <div 
                className="relative rounded-2xl overflow-hidden"
                style={{
                  boxShadow: "0 16px 40px -12px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.1)",
                }}
              >
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-52 object-cover"
                />
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.2) 100%)",
                  }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-2 bg-destructive text-white rounded-xl shadow-lg transition-transform hover:scale-105"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="dropzone-3d w-full h-52 flex flex-col items-center justify-center gap-3"
              >
                <Icon3D icon={ImagePlus} size="xl" variant="ocean" float />
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">Tap to upload</p>
                  <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG up to 5MB</p>
                </div>
              </button>
            )}
          </Card3D>

          {/* Product Details */}
          <Card3D variant="elevated" className="space-y-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3 text-sm font-bold text-foreground">
              <Icon3D icon={Package} size="sm" variant="brand" />
              <span>Product Details</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Title</Label>
              <input
                type="text"
                placeholder="e.g., iPhone 13 Pro Max 256GB"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="input-tactile w-full"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Description</Label>
              <textarea
                placeholder="Describe your product... condition, features, etc."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="input-tactile w-full min-h-[90px] resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Price (XAF)</Label>
              <input
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                className="input-tactile w-full text-lg font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => handleChange("condition", value)}
              >
                <SelectTrigger className="w-full h-11 rounded-xl">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like_new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card3D>

          {/* Category Selection - Dropdown */}
          <Card3D variant="elevated" className="space-y-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3 text-sm font-bold text-foreground">
              <Icon3D icon={Tag} size="sm" variant="brand" />
              <span>Category</span>
            </div>

            <Select
              value={formData.category}
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger className="w-full h-11 rounded-xl">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-card z-50">
                {LISTING_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card3D>

          {/* AI Caption Assist */}
          <div className="animate-fade-up" style={{ animationDelay: "0.25s" }}>
            <AICaptionAssist
              description={formData.description}
              itemName={formData.title}
              priceXAF={parseFloat(formData.price) || 0}
              onUse={(text) => handleChange("description", text)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            {currentPost && (
              <SharePostButton
                post={currentPost}
                isVerified={isVerified}
                variant="outline"
                size="lg"
                className="flex-1 h-14 rounded-2xl font-bold"
                label="Share as Image"
              />
            )}
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="btn-3d flex-1 gap-3 rounded-2xl h-14 text-base font-bold text-white"
            >
              {isLoading ? "Saving..." : "Save Changes"}
              <Save className="w-5 h-5" strokeWidth={2.5} />
            </Button>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}