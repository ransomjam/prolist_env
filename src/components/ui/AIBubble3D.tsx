import { cn } from "@/lib/utils";
import { Sparkles, Brain, Wand2 } from "lucide-react";
import { forwardRef } from "react";

interface AIBubble3DProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "suggestion" | "thinking" | "result";
  delay?: number;
}

export const AIBubble3D = forwardRef<HTMLDivElement, AIBubble3DProps>(
  ({ className, variant = "suggestion", delay = 0, children, ...props }, ref) => {
    const Icon = variant === "thinking" ? Brain : variant === "result" ? Wand2 : Sparkles;

    return (
      <div
        ref={ref}
        className={cn(
          "bubble-3d",
          className
        )}
        style={{ 
          animationDelay: `${delay}ms`,
        }}
        {...props}
      >
        {/* AI indicator dot */}
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            background: "var(--gradient-brand)",
            boxShadow: "0 4px 12px -2px rgba(15, 191, 109, 0.4)",
          }}
        >
          <Icon className="w-3 h-3 text-white" strokeWidth={2.5} />
        </div>
        
        {children}
      </div>
    );
  }
);

AIBubble3D.displayName = "AIBubble3D";
