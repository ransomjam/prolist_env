import { useState, useEffect } from "react";
import { User as UserType } from "@/types/transaction";
import { saveUser, setSession } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Phone, Building2, MapPin, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProfileSettingsSheetProps {
  user: UserType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (user: UserType) => void;
}

const CAMEROON_CITIES = [
  "Douala",
  "Yaoundé",
  "Bamenda",
  "Bafoussam",
  "Garoua",
  "Maroua",
  "Ngaoundéré",
  "Bertoua",
  "Limbe",
  "Buea",
  "Kribi",
  "Ebolowa",
  "Kumba",
  "Nkongsamba",
  "Dschang",
];

export function ProfileSettingsSheet({ 
  user, 
  open, 
  onOpenChange,
  onUpdate 
}: ProfileSettingsSheetProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    businessName: "",
    city: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && open) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        businessName: (user as any).businessName || "",
        city: user.city || "",
      });
    }
  }, [user, open]);

  const handleSave = async () => {
    if (!user) return;

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    
    // Simulate a brief delay for UX
    await new Promise(resolve => setTimeout(resolve, 400));

    const updatedUser: UserType = {
      ...user,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      city: formData.city,
      businessName: formData.businessName.trim(),
    } as UserType;

    saveUser(updatedUser);
    setSession(updatedUser);
    onUpdate(updatedUser);
    setSaving(false);
    toast.success("Profile updated successfully");
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-5 pb-0 text-left">
            <SheetTitle className="text-xl font-bold text-foreground">
              Edit Profile
            </SheetTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Update your personal information
            </p>
          </SheetHeader>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                className="h-12 rounded-xl bg-muted/50 border-border/60 focus:border-primary"
                maxLength={100}
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+237 6XX XXX XXX"
                className="h-12 rounded-xl bg-muted/50 border-border/60 focus:border-primary"
                maxLength={20}
              />
            </div>

            {/* Business Name Field */}
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                Business Name
                <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="Your store or business name"
                className="h-12 rounded-xl bg-muted/50 border-border/60 focus:border-primary"
                maxLength={100}
              />
            </div>

            {/* City Field */}
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                City
              </Label>
              <Select
                value={formData.city}
                onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
              >
                <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-border/60 focus:border-primary">
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {CAMEROON_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email Display (Read-only) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Email Address
              </Label>
              <div className="h-12 rounded-xl bg-muted/30 border border-border/40 px-4 flex items-center">
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex-shrink-0 p-5 pt-0 pb-8">
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 rounded-xl text-sm font-semibold"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" strokeWidth={2} />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
