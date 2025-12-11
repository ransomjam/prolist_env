import QRCode from "react-qr-code";
import { cn } from "@/lib/utils";

interface QRDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRDisplay({ value, size = 180, className }: QRDisplayProps) {
  return (
    <div className={cn("bg-white p-4 rounded-xl flex justify-center", className)}>
      <QRCode value={value} size={size} />
    </div>
  );
}
