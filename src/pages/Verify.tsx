import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile, uploadVerificationFile } from "@/lib/supabaseStorage";
import { toast } from "sonner";
import { 
  Shield, 
  CreditCard, 
  Camera, 
  X, 
  CheckCircle, 
  Clock,
  AlertCircle,
  ArrowRight
} from "lucide-react";

const CAMEROON_CITIES = [
  "Yaoundé",
  "Douala",
  "Bamenda",
  "Bafoussam",
  "Garoua",
  "Maroua",
  "Ngaoundéré",
  "Bertoua",
  "Ebolowa",
  "Buea",
  "Limbe",
  "Kumba",
  "Kribi",
  "Other"
];

export default function Verify() {
  const navigate = useNavigate();
  const { authUser, loading, refreshProfile } = useAuth();
  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    city: "",
  });
  const [idImage, setIdImage] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [confirmAccurate, setConfirmAccurate] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    if (!authUser) {
      navigate("/auth/login");
      return;
    }

    // Already verified
    if (authUser.profile?.verification_status === "VERIFIED") {
      toast.success("You're already verified!");
      navigate("/home");
      return;
    }

    // Pre-fill from profile
    if (authUser.profile?.name && !formData.fullName) {
      setFormData(prev => ({ ...prev, fullName: authUser.profile?.name || "" }));
    }
    if (authUser.profile?.city && !formData.city) {
      setFormData(prev => ({ ...prev, city: authUser.profile?.city || "" }));
    }
  }, [authUser, loading, navigate]);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "id" | "selfie"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === "id") {
          setIdImage(file);
          setIdPreview(result);
        } else {
          setSelfieImage(file);
          setSelfiePreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type: "id" | "selfie") => {
    if (type === "id") {
      setIdImage(null);
      setIdPreview(null);
      if (idInputRef.current) idInputRef.current.value = "";
    } else {
      setSelfieImage(null);
      setSelfiePreview(null);
      if (selfieInputRef.current) selfieInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authUser) return;

    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!formData.city) {
      toast.error("Please select your city");
      return;
    }

    if (!idImage) {
      toast.error("Please upload your National ID");
      return;
    }

    if (!selfieImage) {
      toast.error("Please upload a selfie holding your ID");
      return;
    }

    if (!confirmAccurate) {
      toast.error("Please confirm that your details are accurate");
      return;
    }

    setIsLoading(true);

    try {
      // Upload verification files
      await uploadVerificationFile(authUser.id, "id_card", idImage);
      await uploadVerificationFile(authUser.id, "selfie", selfieImage);

      // Update profile with verification data
      await updateProfile(authUser.id, {
        name: formData.fullName.trim(),
        city: formData.city,
        verification_status: "PENDING",
      });

      await refreshProfile();
      
      toast.success("Verification submitted — processing.");
      navigate("/profile");
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast.error("Failed to submit verification. Please try again.");
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

  // Show pending state
  if (authUser?.profile?.verification_status === "PENDING") {
    return (
      <div className="min-h-screen page-premium pb-24">
        <TopBar title="Verification" showBack />
        <main className="relative z-10 p-4 flex items-center justify-center min-h-[60vh]">
          <GlassCard className="text-center py-12 max-w-sm">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-warning/20 to-warning/5 mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-10 h-10 text-warning" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Verification Pending
            </h2>
            <p className="text-sm text-muted-foreground">
              Your verification is being processed. We'll notify you once it's complete.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => navigate("/profile")}
            >
              Back to Profile
            </Button>
          </GlassCard>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Show rejected state
  if (authUser?.profile?.verification_status === "REJECTED") {
    return (
      <div className="min-h-screen page-premium pb-24">
        <TopBar title="Verification" showBack />
        <main className="relative z-10 p-4 flex items-center justify-center min-h-[60vh]">
          <GlassCard className="text-center py-12 max-w-sm">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-destructive/20 to-destructive/5 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-destructive" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Verification Rejected
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your verification was not approved. Please re-submit with valid documents.
            </p>
            <Button
              onClick={async () => {
                if (authUser) {
                  await updateProfile(authUser.id, { verification_status: "UNVERIFIED" });
                  await refreshProfile();
                  window.location.reload();
                }
              }}
            >
              Re-verify →
            </Button>
          </GlassCard>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-premium pb-24">
      <TopBar title="Seller Verification" showBack />

      <main className="relative z-10 p-4 pb-8">
        {/* Header */}
        <div className="text-center py-6 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-primary via-teal to-ocean shadow-glow mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Verify Your Account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete verification to start selling securely
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Full Name */}
          <GlassCard variant="elevated" className="space-y-4 animate-fade-up">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold">
                1
              </div>
              Full Name
            </div>
            <Input
              placeholder="Enter your full legal name"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="input-premium"
            />
          </GlassCard>

          {/* Step 2: City */}
          <GlassCard variant="elevated" className="space-y-4 animate-fade-up" style={{ animationDelay: "0.05s" }}>
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold">
                2
              </div>
              City
            </div>
            <Select
              value={formData.city}
              onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
            >
              <SelectTrigger className="input-premium">
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {CAMEROON_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </GlassCard>

          {/* Step 3: National ID */}
          <GlassCard variant="elevated" className="space-y-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold">
                3
              </div>
              Upload National ID (Front)
            </div>

            <input
              ref={idInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleImageUpload(e, "id")}
            />

            {idPreview ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={idPreview}
                  alt="National ID"
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage("id")}
                  className="absolute top-2 right-2 p-2 bg-destructive/90 backdrop-blur text-destructive-foreground rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary/90 backdrop-blur rounded-lg text-xs text-primary-foreground font-medium">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  ID Uploaded
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => idInputRef.current?.click()}
                className="dropzone-premium w-full h-40 flex flex-col items-center justify-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ocean/20 to-ocean/5 flex items-center justify-center">
                  <CreditCard className="w-7 h-7 text-ocean" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">Tap to upload ID</p>
                  <p className="text-xs text-muted-foreground mt-1">Clear photo of front side</p>
                </div>
              </button>
            )}
          </GlassCard>

          {/* Step 4: Selfie with ID */}
          <GlassCard variant="elevated" className="space-y-4 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold">
                4
              </div>
              Selfie Holding Your ID
            </div>

            <input
              ref={selfieInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => handleImageUpload(e, "selfie")}
            />

            {selfiePreview ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={selfiePreview}
                  alt="Selfie with ID"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage("selfie")}
                  className="absolute top-2 right-2 p-2 bg-destructive/90 backdrop-blur text-destructive-foreground rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary/90 backdrop-blur rounded-lg text-xs text-primary-foreground font-medium">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Selfie Uploaded
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => selfieInputRef.current?.click()}
                className="dropzone-premium w-full h-48 flex flex-col items-center justify-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal/20 to-teal/5 flex items-center justify-center">
                  <Camera className="w-7 h-7 text-teal" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">Tap to take selfie</p>
                  <p className="text-xs text-muted-foreground mt-1">Hold your ID next to your face</p>
                </div>
              </button>
            )}
          </GlassCard>

          {/* Step 5: Confirmation Checkbox */}
          <GlassCard variant="elevated" className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-start gap-3">
              <Checkbox
                id="confirm"
                checked={confirmAccurate}
                onCheckedChange={(checked) => setConfirmAccurate(checked === true)}
                className="mt-0.5"
              />
              <label
                htmlFor="confirm"
                className="text-sm text-foreground cursor-pointer"
              >
                I confirm that these details are accurate and match my official documents.
              </label>
            </div>
          </GlassCard>

          {/* Submit Button */}
          <Button
            type="submit"
            size="full"
            disabled={isLoading || !confirmAccurate}
            className="btn-glow gap-2 rounded-2xl h-14 text-base font-bold animate-fade-up"
            style={{ animationDelay: "0.25s" }}
          >
            {isLoading ? "Submitting..." : "Submit for Verification"}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
