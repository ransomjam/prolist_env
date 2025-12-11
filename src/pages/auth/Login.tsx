import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/GlassCard";
import { Shield, Mail, Lock, User, Truck, Store, UserCog, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Demo accounts for easy testing
const DEMO_ACCOUNTS = [
  {
    label: "Login as Seller",
    email: "seller@demo.com",
    password: "123456",
    icon: Store,
    toast: "Logged in as Demo Seller",
    color: "text-primary",
  },
  {
    label: "Login as Buyer",
    email: "buyer@demo.com",
    password: "123456",
    icon: User,
    toast: "Logged in as Demo Buyer",
    color: "text-muted-foreground",
  },
  {
    label: "Login as Admin",
    email: "admin@demo.com",
    password: "123456",
    icon: UserCog,
    toast: "Logged in as Admin",
    color: "text-ocean",
  },
  {
    label: "Login as Agent",
    email: "agent@demo.com",
    password: "123456",
    icon: Truck,
    toast: "Logged in as Delivery Agent",
    color: "text-teal",
  },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    toast.success("Welcome back!");
    navigate("/home");
    setIsLoading(false);
  };

  const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setIsLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });

    if (authError) {
      setError(`Demo login failed: ${authError.message}`);
      setIsLoading(false);
      return;
    }

    toast.success(account.toast);
    navigate("/home");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 animate-fade-up">
        {/* Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">ProList Protect</h1>
          <p className="text-sm text-muted-foreground">Secure escrow for social sellers</p>
        </div>

        {/* Login Form */}
        <GlassCard variant="elevated" className="space-y-5">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12"
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12"
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button type="submit" size="full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/auth/register" className="text-primary font-medium hover:underline">
              Register
            </Link>
          </p>
        </GlassCard>

        {/* Demo Users Section */}
        <GlassCard className="space-y-4">
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Demo Accounts</p>
            <p className="text-xs text-muted-foreground">Quick login for testing</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <Button
                key={account.email}
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin(account)}
                disabled={isLoading}
                className="justify-start gap-2 h-10"
              >
                <account.icon className={`w-4 h-4 ${account.color}`} strokeWidth={1.5} />
                <span className="text-xs truncate">{account.label.replace("Login as ", "")}</span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground">
            All demo accounts use password: 123456
          </p>
        </GlassCard>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-4 h-4 text-primary" strokeWidth={1.5} />
          <span>Your transactions are protected by escrow</span>
        </div>
      </div>
    </div>
  );
}
