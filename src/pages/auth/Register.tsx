import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/GlassCard";
import { Shield, User, Mail, Lock, MapPin, Camera, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    city: "",
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!formData.password.trim() || formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    const redirectUrl = `${window.location.origin}/`;

    const { data, error: authError } = await supabase.auth.signUp({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: formData.name.trim(),
          city: formData.city.trim() || null,
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      // Check if email confirmation is required
      if (data.session) {
        // User was logged in directly (email confirmation disabled)
        toast.success("Account created successfully!");
        navigate("/home");
      } else {
        // Email confirmation required
        toast.success("Please check your email to confirm your account");
        navigate("/auth/login");
      }
    }

    setIsLoading(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen aurora-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 animate-fade-up">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-teal to-blue shadow-glow">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-sm text-muted">Join ProList Protect</p>
        </div>

        <GlassCard variant="elevated" className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Picture Upload */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleAvatarClick}
                className="relative group"
                disabled={isLoading}
              >
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors bg-muted/30 flex items-center justify-center">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : formData.name ? (
                    <span className="text-2xl font-bold text-muted">
                      {getInitials(formData.name)}
                    </span>
                  ) : (
                    <User className="w-10 h-10 text-muted" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4 text-primary-foreground" />
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-center text-muted">Add profile photo (optional)</p>

            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <Input 
                placeholder="Full Name" 
                value={formData.name} 
                onChange={(e) => handleChange("name", e.target.value)} 
                className="pl-12"
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <Input 
                type="email" 
                placeholder="Email address" 
                value={formData.email} 
                onChange={(e) => handleChange("email", e.target.value)} 
                className="pl-12"
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <Input 
                type="password" 
                placeholder="Password (min 6 characters)" 
                value={formData.password} 
                onChange={(e) => handleChange("password", e.target.value)} 
                className="pl-12"
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <Input 
                placeholder="City (Optional)" 
                value={formData.city} 
                onChange={(e) => handleChange("city", e.target.value)} 
                className="pl-12"
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button type="submit" size="full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-sm text-center text-muted">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
