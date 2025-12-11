import { Scanner } from "@yudiel/react-qr-scanner";
import { cn } from "@/lib/utils";

interface QRScannerProps {
  onScan: (result: string) => void;
  className?: string;
}

export function QRScanner({ onScan, className }: QRScannerProps) {
  return (
    <div className={cn("rounded-xl overflow-hidden", className)}>
      <Scanner
        onScan={(result) => {
          if (result?.[0]?.rawValue) {
            onScan(result[0].rawValue);
          }
        }}
        styles={{
          container: { borderRadius: "12px" },
        }}
      />
    </div>
  );
}
