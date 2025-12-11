import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card3D } from "@/components/ui/Card3D";
import { Icon3D } from "@/components/ui/Icon3D";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AICaptionAssist } from "@/components/AICaptionAssist";
import { OTPModal } from "@/components/OTPModal";
import { useAuth } from "@/hooks/useAuth";
import { createPost, uploadPostImage } from "@/lib/supabaseStorage";
import { LISTING_CATEGORIES } from "@/types/listing";
import { toast } from "sonner";
import { ArrowRight, Package, Tag, X, Camera, ImagePlus } from "lucide-react";

export default function CreatePost() {
  const navigate = useNavigate();
  const { authUser, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
  });

  const isVerifiedSeller = authUser?.profile?.verification_status === "VERIFIED";
  const isAdminOrAgent = authUser?.primaryRole === "ADMIN" || authUser?.primaryRole === "AGENT";

  useEffect(() => {
    if (loading) return;
    
    if (!authUser) {
      navigate("/auth/login");
      return;
    }
    
    if (!isAdminOrAgent && !isVerifiedSeller) {
      toast.error("Verify your account to start selling securely.");
      navigate("/verify");
      return;
    }
  }, [authUser, loading, isVerifiedSeller, isAdminOrAgent, navigate]);

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

    setShowOTPModal(true);
  };

  const handleOTPVerified = async () => {
    if (!authUser) return;
    
    setIsLoading(true);

    try {
      // Upload image if exists
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadPostImage(authUser.id, imageFile);
      }

      const post = await createPost({
        seller_id: authUser.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        category: formData.category || null,
        condition: formData.condition || null,
        image_url: imageUrl,
        visibility: "PUBLIC",
        caption_history: [],
      });

      if (post) {
        toast.success("Listing created successfully!");
        navigate(`/listing-success/${post.id}`);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen page-premium flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-premium pb-24">
      <TopBar title="Create Listing" showBack />

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

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="btn-3d w-full gap-3 rounded-2xl h-14 text-base font-bold text-white"
          >
            {isLoading ? "Creating..." : "Create Listing"}
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </Button>
        </form>
      </main>

      <BottomNav />

      <OTPModal
        open={showOTPModal}
        onOpenChange={setShowOTPModal}
        onVerify={handleOTPVerified}
        title="Confirm Post Creation"
        description="Enter your PIN to create this post"
      />
    </div>
  );
}