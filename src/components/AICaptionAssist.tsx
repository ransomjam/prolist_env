import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card3D } from "@/components/ui/Card3D";
import { Icon3D } from "@/components/ui/Icon3D";
import { AIBubble3D } from "@/components/ui/AIBubble3D";
import { saveAIHistory } from "@/lib/storage";
import { toast } from "sonner";
import { Sparkles, Copy, Check, Loader2, Wand2, Scissors, Flame, Globe, MessageCircle, Handshake, Brain } from "lucide-react";

type CaptionMode = "generate" | "improve" | "shorten" | "catchy" | "fr" | "pidgin" | "trust";

const MODES: { id: CaptionMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "generate", label: "Generate", icon: Sparkles },
  { id: "improve", label: "Improve", icon: Wand2 },
  { id: "shorten", label: "Shorten", icon: Scissors },
  { id: "catchy", label: "Catchy", icon: Flame },
  { id: "fr", label: "French", icon: Globe },
  { id: "pidgin", label: "Pidgin", icon: MessageCircle },
  { id: "trust", label: "Trust", icon: Handshake },
];

interface AICaptionAssistProps {
  description: string;
  itemName: string;
  priceXAF: number;
  onUse: (text: string) => void;
  postId?: string;
}

interface Variation {
  mode: CaptionMode;
  text: string;
}

const WEBHOOK_URL = "https://automation.n8nyt.online/webhook/product-caption";

export function AICaptionAssist({ description, itemName, priceXAF, onUse, postId }: AICaptionAssistProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<CaptionMode | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateCaption = async (mode: CaptionMode) => {
    if (!itemName.trim()) {
      toast.error("Please enter an item name first");
      return;
    }

    if (!priceXAF || priceXAF <= 0) {
      toast.error("Please enter a valid price first");
      return;
    }

    setIsLoading(true);
    setSelectedMode(mode);

    // Map "generate" to "improve" for the API since they work the same
    const apiMode = mode === "generate" ? "improve" : mode;

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: itemName.trim(),
          description: description.trim(),
          priceXAF,
          existingCaption: description.trim(),
          mode: apiMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Failed to generate caption");
      }

      const data = await response.json();
      
      if (data.variations && Array.isArray(data.variations)) {
        setVariations(data.variations.map((v: { text: string }) => ({ 
          mode, 
          text: v.text 
        })));
      } else if (data.text) {
        setVariations([{ mode, text: data.text }]);
      } else {
        throw new Error("Invalid response format");
      }

      toast.success("Captions generated!");
    } catch (error) {
      console.error("AI caption error:", error);
      toast.error("Failed to generate caption. Using fallback.");
      
      const formattedPrice = new Intl.NumberFormat("fr-CM", {
        style: "decimal",
        minimumFractionDigits: 0,
      }).format(priceXAF) + " XAF";

      const fallbacks: Record<CaptionMode, string[]> = {
        generate: [
          `${itemName} - ${description || "Premium quality!"} Only ${formattedPrice}`,
          `Get this ${itemName} today at ${formattedPrice}. Don't miss out!`,
        ],
        improve: [
          `${itemName} - ${description || "Premium quality!"} Only ${formattedPrice}`,
          `Get this ${itemName} today at ${formattedPrice}. Don't miss out!`,
        ],
        shorten: [
          `${itemName} - ${formattedPrice}`,
          `${itemName}. ${formattedPrice}. DM to order!`,
        ],
        catchy: [
          `${itemName} - Hot deal at just ${formattedPrice}!`,
          `Hot deal! ${itemName} at ${formattedPrice}`,
        ],
        fr: [
          `${itemName} - Qualité supérieure! ${formattedPrice}`,
          `À vendre: ${itemName} à seulement ${formattedPrice}`,
        ],
        pidgin: [
          `${itemName} dey! Na ${formattedPrice} only`,
          `Fine ${itemName} for you! ${formattedPrice}. Come grab am!`,
        ],
        trust: [
          `${itemName} - ${formattedPrice}. Pay securely with ProList Protect`,
          `${itemName} at ${formattedPrice}. Your money stays safe until delivery`,
        ],
      };
      
      setVariations(fallbacks[mode].map(text => ({ mode, text })));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUse = (variation: Variation) => {
    onUse(variation.text);
    saveAIHistory({
      postId,
      mode: variation.mode,
      originalText: description,
      generatedText: variation.text,
      usedAt: new Date().toISOString(),
    });
    toast.success("Caption applied!");
    setVariations([]);
    setSelectedMode(null);
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isDisabled = !itemName.trim() || !priceXAF || priceXAF <= 0;

  return (
    <Card3D variant="elevated" className="space-y-4">
      <div className="flex items-center gap-3">
        <Icon3D icon={Brain} size="sm" variant="brand" float />
        <div>
          <p className="text-sm font-bold text-foreground">AI Caption Assist</p>
          <p className="text-xs text-muted-foreground">
            {isDisabled 
              ? "Add item name and price to enable"
              : "Enhance your description with AI"
            }
          </p>
        </div>
      </div>

      {/* Mode Buttons - 4 columns for first row, 3 for second */}
      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-2">
          {MODES.slice(0, 4).map((mode) => {
            const ModeIcon = mode.icon;
            const isSelected = selectedMode === mode.id;
            
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => generateCaption(mode.id)}
                disabled={isLoading || isDisabled}
                className={`
                  category-3d p-2.5 flex flex-col items-center gap-1.5 transition-all
                  ${isSelected ? "category-3d-selected" : ""}
                  ${(isLoading || isDisabled) ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {isLoading && isSelected ? (
                  <Loader2 className="w-4 h-4 animate-spin text-ocean" />
                ) : (
                  <ModeIcon className={`w-4 h-4 ${isSelected ? "text-ocean" : "text-muted-foreground"}`} />
                )}
                <span className={`text-2xs font-semibold ${isSelected ? "text-ocean" : "text-foreground"}`}>
                  {mode.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MODES.slice(4).map((mode) => {
            const ModeIcon = mode.icon;
            const isSelected = selectedMode === mode.id;
            
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => generateCaption(mode.id)}
                disabled={isLoading || isDisabled}
                className={`
                  category-3d p-2.5 flex flex-col items-center gap-1.5 transition-all
                  ${isSelected ? "category-3d-selected" : ""}
                  ${(isLoading || isDisabled) ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {isLoading && isSelected ? (
                  <Loader2 className="w-4 h-4 animate-spin text-ocean" />
                ) : (
                  <ModeIcon className={`w-4 h-4 ${isSelected ? "text-ocean" : "text-muted-foreground"}`} />
                )}
                <span className={`text-2xs font-semibold ${isSelected ? "text-ocean" : "text-foreground"}`}>
                  {mode.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Floating Bubbles for Results */}
      {variations.length > 0 && (
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-ocean" />
            Generated Captions ({variations.length})
          </p>
          {variations.map((variation, index) => (
            <AIBubble3D
              key={index}
              variant="result"
              delay={index * 100}
              className="space-y-3"
            >
              <p className="text-sm text-foreground leading-relaxed">{variation.text}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleUse(variation)}
                  className="flex-1 btn-3d rounded-xl gap-1.5 text-white"
                >
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                  Use
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(variation.text, index)}
                  className="flex-1 rounded-xl gap-1.5"
                >
                  {copiedIndex === index ? (
                    <Check className="w-4 h-4 text-primary" strokeWidth={2.5} />
                  ) : (
                    <Copy className="w-4 h-4" strokeWidth={2} />
                  )}
                  Copy
                </Button>
              </div>
            </AIBubble3D>
          ))}
        </div>
      )}
    </Card3D>
  );
}
