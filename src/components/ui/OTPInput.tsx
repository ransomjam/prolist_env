import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  className,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(
    value.split("").concat(Array(length - value.length).fill(""))
  );

  useEffect(() => {
    const newDigits = value.split("").concat(Array(length - value.length).fill(""));
    setDigits(newDigits.slice(0, length));
  }, [value, length]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, val: string) => {
    if (disabled) return;

    // Handle paste
    if (val.length > 1) {
      const pastedValue = val.slice(0, length);
      const newDigits = pastedValue.split("").concat(Array(length - pastedValue.length).fill(""));
      setDigits(newDigits.slice(0, length));
      onChange(pastedValue);
      if (pastedValue.length === length && onComplete) {
        onComplete(pastedValue);
      }
      const focusIndex = Math.min(pastedValue.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = val;
    setDigits(newDigits);

    const newValue = newDigits.join("");
    onChange(newValue);

    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newValue.length === length && !newValue.includes("") && onComplete) {
      onComplete(newValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className={cn("flex justify-center gap-2", className)}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={length}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          className={cn(
            "w-12 h-14 text-center text-xl font-semibold rounded-xl border border-accent bg-white/80 backdrop-blur-sm transition-all duration-200",
            "focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/15",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        />
      ))}
    </div>
  );
}
