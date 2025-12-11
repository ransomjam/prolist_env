import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTransaction, saveSmartShareHistory } from "@/lib/storage";
import { Transaction, SmartShareVariation } from "@/types/transaction";
import { toast } from "sonner";
import {
  Sparkles,
  Copy,
  Share2,
  MessageCircle,
  Facebook,
  Link,
  CheckCircle,
} from "lucide-react";

export default function SmartShare() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [description, setDescription] = useState("");
  const [variations, setVariations] = useState<SmartShareVariation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    if (!transactionId) {
      navigate("/home");
      return;
    }

    const tx = getTransaction(transactionId);
    if (!tx) {
      toast.error("Transaction not found");
      navigate("/home");
      return;
    }

    setTransaction(tx);
  }, [transactionId, navigate]);

  const generateVariations = async () => {
    if (!transaction) return;

    setIsLoading(true);

    try {
      const n8nUrl = import.meta.env.VITE_N8N_SMART_SHARE_URL;

      if (n8nUrl) {
        const response = await fetch(n8nUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemName: transaction.productName,
            description: description || "",
            paymentLink: transaction.paymentLink,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setVariations(data.variations || []);
        } else {
          throw new Error("API error");
        }
      } else {
        // Fallback: generate mock variations
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const price = new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
          minimumFractionDigits: 0,
        }).format(transaction.price);

        setVariations([
          {
            text: `🔥 HOT DEAL! ${transaction.productName} now available for just ${price}!\n\n✅ 100% Secure Payment via Escrow\n📍 Delivery to ${transaction.deliveryLocation}\n\n🛒 Order now: ${transaction.paymentLink}`,
          },
          {
            text: `💎 ${transaction.productName}\n\nPrice: ${price}\n\n🔒 Payment protected by ProList Escrow\n🚚 Fast delivery to ${transaction.deliveryLocation}\n\nBuy securely: ${transaction.paymentLink}`,
          },
          {
            text: `NEW ARRIVAL 🆕\n\n${transaction.productName}\n${price}\n\n✨ Guaranteed original\n🔐 Escrow protected\n📦 Delivered to ${transaction.deliveryLocation}\n\n${transaction.paymentLink}`,
          },
        ]);
      }

      // Save to history
      saveSmartShareHistory({
        transactionId: transaction.id,
        productName: transaction.productName,
        variations,
        createdAt: new Date().toISOString(),
      });

      toast.success("Post variations generated!");
    } catch (error) {
      console.error("Error generating variations:", error);
      toast.error("Failed to generate variations");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(index);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const shareToWhatsApp = (text: string) => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const shareToFacebook = (text: string) => {
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  if (!transaction) {
    return null;
  }

  return (
    <div className="min-h-screen aurora-bg">
      <TopBar title="Smart Share" showBack />

      <main className="p-4 pb-8 space-y-4">
        {/* Payment Link Card */}
        <GlassCard className="animate-fade-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <Link className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Secure Payment Link</p>
              <p className="text-xs text-muted truncate">{transaction.paymentLink}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => copyToClipboard(transaction.paymentLink, -1)}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
        </GlassCard>

        {/* AI Generator */}
        <GlassCard className="space-y-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">AI Post Generator</h3>
          </div>

          <Input
            label="Short Description (Optional)"
            placeholder="e.g., Brand new, sealed, with warranty"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Button
            size="full"
            onClick={generateVariations}
            disabled={isLoading}
            className="gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {isLoading ? "Generating..." : "Improve with AI"}
          </Button>
        </GlassCard>

        {/* Generated Variations */}
        {variations.length > 0 && (
          <section className="space-y-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-sm font-semibold text-foreground px-1">
              Post Variations
            </h3>

            {variations.map((variation, index) => (
              <GlassCard key={index} className="space-y-4">
                <div className="bg-white/50 rounded-xl p-3">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {variation.text}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => copyToClipboard(variation.text, index)}
                  >
                    {copied === index ? (
                      <CheckCircle className="w-4 h-4 mr-1 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    Copy
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => shareToWhatsApp(variation.text)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1 text-green-600" />
                    WhatsApp
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => shareToFacebook(variation.text)}
                  >
                    <Facebook className="w-4 h-4 mr-1 text-blue-600" />
                    Facebook
                  </Button>
                </div>
              </GlassCard>
            ))}
          </section>
        )}

        {/* Native Share */}
        {navigator.share && (
          <Button
            variant="secondary"
            size="full"
            onClick={() =>
              navigator.share({
                title: transaction.productName,
                text: `Check out ${transaction.productName}`,
                url: transaction.paymentLink,
              })
            }
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share via...
          </Button>
        )}
      </main>
    </div>
  );
}
