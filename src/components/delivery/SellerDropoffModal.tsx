import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogisticsDetails, Transaction } from "@/types/transaction";
import { toast } from "sonner";
import { Truck, Building2, MapPin, FileText } from "lucide-react";

interface SellerDropoffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction;
  onSubmit: (logistics: LogisticsDetails) => void;
}

const DROPOFF_COMPANIES = [
  "ProList Express",
  "City Logistics",
  "FastTrack Delivery",
  "SafeHand Courier",
  "Other"
];

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
  "Kribi"
];

export function SellerDropoffModal({ 
  open, 
  onOpenChange, 
  transaction, 
  onSubmit 
}: SellerDropoffModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [logistics, setLogistics] = useState<LogisticsDetails>({
    dropoffCompany: "",
    dropoffCity: "",
    dropoffNote: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!logistics.dropoffCompany) {
      toast.error("Please select a dropoff company");
      return;
    }

    if (!logistics.dropoffCity) {
      toast.error("Please select the dropoff city");
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onSubmit(logistics);
    setIsLoading(false);
    onOpenChange(false);
    toast.success("Marked as In Transit to Hub");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Mark In Transit
          </DialogTitle>
          <DialogDescription>
            Enter dropoff details for {transaction.productName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Dropoff Company */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Dropoff Company *
            </Label>
            <Select
              value={logistics.dropoffCompany}
              onValueChange={(value) => setLogistics(prev => ({ ...prev, dropoffCompany: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select courier company" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {DROPOFF_COMPANIES.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dropoff City */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Dropoff City *
            </Label>
            <Select
              value={logistics.dropoffCity}
              onValueChange={(value) => setLogistics(prev => ({ ...prev, dropoffCity: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {CAMEROON_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reference Note (Optional) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Reference / Note (Optional)
            </Label>
            <Textarea
              value={logistics.dropoffNote}
              onChange={(e) => setLogistics(prev => ({ ...prev, dropoffNote: e.target.value }))}
              placeholder="Tracking number, special instructions..."
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-glow"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Confirm Dropoff"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
