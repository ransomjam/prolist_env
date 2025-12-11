import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PremiumAvatar } from "@/components/ui/PremiumAvatar";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getListing, getSellerPosts, saveTransaction, generateId, generateConfirmationCode, saveBuyerTransaction, getSession, getUserById, formatPriceXAF } from "@/lib/storage";
import { Listing } from "@/types/listing";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Shield, MapPin, Lock, ArrowRight, Star, Package, ChevronRight, BadgeCheck, Sparkles, Clock, FileText, Truck, Phone, Calendar, Building2 } from "lucide-react";
import { format } from "date-fns";
import DELIVERY_LOCATIONS, { getUniqueCities, getLocationsByCity, DeliveryLocation } from "@/config/deliveryLocations";

export default function ProductPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [sellerPosts, setSellerPosts] = useState<Listing[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const session = getSession();
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<DeliveryLocation | null>(null);
  const availableCities = getUniqueCities();
  const availableAreas = selectedCity ? getLocationsByCity(selectedCity) : [];
  
  const [formData, setFormData] = useState({
    buyerName: session?.name || "",
    buyerPhone: session?.phone || "",
    buyerEmail: session?.email || "",
    deliveryNotes: "",
  });

  // Update selected location when area changes
  useEffect(() => {
    if (selectedLocationId) {
      const loc = DELIVERY_LOCATIONS.find(l => l.id === selectedLocationId);
      setSelectedLocation(loc || null);
    } else {
      setSelectedLocation(null);
    }
  }, [selectedLocationId]);

  useEffect(() => {
    if (!listingId) {
      navigate("/");
      return;
    }

    const l = getListing(listingId);
    if (!l) {
      toast.error("Product not found");
      navigate("/");
      return;
    }

    setListing(l);

    const otherPosts = getSellerPosts(l.sellerId).filter((p) => p.id !== l.id);
    setSellerPosts(otherPosts);
  }, [listingId, navigate]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRequestPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!listing) return;

    if (!formData.buyerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.buyerPhone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (!selectedCity) {
      toast.error("Please select your city");
      return;
    }

    if (!selectedLocationId || !selectedLocation) {
      toast.error("Please select a delivery area");
      return;
    }

    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const transactionId = generateId();
    const confirmationCode = generateConfirmationCode();

    const transaction = {
      id: transactionId,
      postId: listing.id,
      productName: listing.title,
      description: listing.description,
      price: listing.price,
      deliveryFee: 0,
      sellerName: listing.sellerName,
      sellerPhone: listing.sellerPhone,
      sellerId: listing.sellerId,
      buyerId: session?.id,
      buyerName: formData.buyerName.trim(),
      buyerPhone: formData.buyerPhone.trim(),
      buyerEmail: formData.buyerEmail.trim() || undefined,
      buyerCity: selectedCity,
      deliveryLocation: selectedCity,
      deliveryArea: selectedLocation!.area,
      delivery: {
        city: selectedCity,
        address: selectedLocation!.area,
        notes: formData.deliveryNotes.trim() || undefined,
      },
      logistics: {
        dropoffCompany: selectedLocation!.agencies[0],
        dropoffCity: selectedCity,
        dropoffNote: selectedLocation!.instructions,
      },
      status: "awaiting_payment" as const,
      isPreOrder: listing.isPreOrder || false,
      expectedArrival: listing.expectedArrival,
      preOrderNote: listing.preOrderNote,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentLink: `${window.location.origin}/pay/${transactionId}`,
      confirmationCode,
      buyerTrackingLink: `${window.location.origin}/track/${transactionId}`,
    };

    saveTransaction(transaction);
    saveBuyerTransaction(transactionId);

    toast.success("Payment request created!");
    navigate(`/pay/${transactionId}`);
  };

  const seller = listing ? getUserById(listing.sellerId) : null;
  const isVerifiedSeller = seller?.isVerified || seller?.verificationStatus === "VERIFIED";

  if (!listing) {
    return (
      <div className="min-h-screen page-premium flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-premium safe-top safe-bottom">
      <div className="max-w-md mx-auto">
        {/* Product Image - Parallax Hero */}
        <div className="relative">
          {listing.imageUrl ? (
            <div className="relative h-80 overflow-hidden">
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              
              {/* Category badge */}
              {listing.category && (
                <div className="absolute top-4 left-4">
                  <CategoryIcon categoryId={listing.category} size="lg" />
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center">
              <Package className="w-20 h-20 text-muted-foreground/50" strokeWidth={1} />
            </div>
          )}
        </div>

        <div className="relative z-10 p-4 -mt-8 space-y-4">
          {/* Product Details */}
          <GlassCard variant="premium" className="animate-fade-up">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold text-foreground">{listing.title}</h1>
              {listing.isPreOrder && (
                <StatusBadge variant="timer" className="shrink-0">
                  <Clock className="w-3 h-3 mr-1" />
                  Pre-Order
                </StatusBadge>
              )}
            </div>
            <p className="text-3xl font-extrabold text-gradient-vivid mt-2">{formatPriceXAF(listing.price)}</p>

            {/* Pre-order expected arrival */}
            {listing.isPreOrder && listing.expectedArrival && (
              <div className="mt-3 p-3 rounded-xl bg-warning/10 border border-warning/20">
                <p className="text-sm font-medium text-warning">
                  Expected arrival: {format(new Date(listing.expectedArrival), "PPP")}
                </p>
                {listing.preOrderNote && (
                  <p className="text-xs text-muted-foreground mt-1">{listing.preOrderNote}</p>
                )}
              </div>
            )}

            {listing.description && (
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{listing.description}</p>
            )}

            {/* Delivery availability message */}
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="w-4 h-4 text-primary" />
              {listing.isPreOrder ? (
                <span>Delivery available after arrival date</span>
              ) : (
                <span>Delivery available to your city after payment</span>
              )}
            </div>
          </GlassCard>

          {/* Seller Info */}
          <GlassCard 
            variant="interactive" 
            className="animate-fade-up" 
            style={{ animationDelay: "0.1s" }}
            onClick={() => navigate(`/u/${listing.sellerId}`)}
          >
            <div className="flex items-center gap-4">
              <PremiumAvatar 
                name={listing.sellerName} 
                isVerified={isVerifiedSeller}
                size="md"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{listing.sellerName}</p>
                  {isVerifiedSeller && (
                    <BadgeCheck className="w-5 h-5 text-primary" strokeWidth={2} />
                  )}
                </div>
                {isVerifiedSeller && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                    <span className="text-xs font-medium text-muted-foreground">4.8 rating</span>
                  </div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </GlassCard>

          {/* Escrow Protection - Premium */}
          <GlassCard 
            className="border-primary/20 bg-gradient-to-br from-primary/8 to-transparent animate-fade-up" 
            style={{ animationDelay: "0.15s" }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-primary" strokeWidth={2} />
              </div>
              <div>
                <p className="font-bold text-foreground">Secure Escrow Protection</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Your money is only released after you confirm delivery.
                </p>
              </div>
            </div>
            
            {/* Trust indicators */}
            <div className="flex gap-3 mt-4">
              <div className="trust-badge">
                <Lock className="w-3 h-3" />
                <span>Secure</span>
              </div>
              <div className="trust-badge">
                <Sparkles className="w-3 h-3" />
                <span>Protected</span>
              </div>
            </div>
          </GlassCard>

          {/* Request Payment Form */}
          {showRequestForm ? (
            <GlassCard variant="elevated" className="space-y-5 animate-scale-in">
              <h3 className="font-bold text-foreground">Your Details</h3>

              <form onSubmit={handleRequestPayment} className="space-y-4">
                <Input
                  label="Your Name"
                  placeholder="Full name"
                  value={formData.buyerName}
                  onChange={(e) => handleChange("buyerName", e.target.value)}
                  className="input-premium"
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+237 6XX XXX XXX"
                  value={formData.buyerPhone}
                  onChange={(e) => handleChange("buyerPhone", e.target.value)}
                  className="input-premium"
                />

                <Input
                  label="Email (Optional)"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.buyerEmail}
                  onChange={(e) => handleChange("buyerEmail", e.target.value)}
                  className="input-premium"
                />

                {/* Delivery Details Section */}
                <div className="space-y-4 pt-4 border-t border-border/30">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Truck className="w-4 h-4 text-primary" strokeWidth={2} />
                    Delivery Location
                  </div>

                  <GlassCard className="space-y-4 bg-card/50 border-border/40">
                    {/* City Select */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        City *
                      </label>
                      <Select 
                        value={selectedCity} 
                        onValueChange={(val) => {
                          setSelectedCity(val);
                          setSelectedLocationId("");
                        }}
                      >
                        <SelectTrigger className="input-premium">
                          <SelectValue placeholder="Select your city" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCities.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Area Select */}
                    {selectedCity && (
                      <div className="space-y-2 animate-fade-up">
                        <label className="text-sm font-semibold flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          Delivery Area *
                        </label>
                        <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                          <SelectTrigger className="input-premium">
                            <SelectValue placeholder="Select delivery area" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableAreas.map((loc) => (
                              <SelectItem key={loc.id} value={loc.id}>{loc.area}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Selected Hub Info */}
                    {selectedLocation && (
                      <div className="space-y-3 pt-3 border-t border-border/30 animate-fade-up">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                          <Truck className="w-3.5 h-3.5" />
                          ProList Hub Info
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-foreground">Partner Agencies</p>
                              <ul className="text-muted-foreground text-xs mt-1 space-y-0.5">
                                {selectedLocation.agencies.map((agency, i) => (
                                  <li key={i}>• {agency}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-foreground">Working Hours</p>
                              <p className="text-muted-foreground text-xs">{selectedLocation.workingHours}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-foreground">{selectedLocation.contactPerson}</p>
                              <p className="text-muted-foreground text-xs">{selectedLocation.contactPhone}</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                          {selectedLocation.instructions}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Delivery Notes (Optional)
                      </label>
                      <Textarea
                        placeholder="Special instructions for delivery..."
                        value={formData.deliveryNotes}
                        onChange={(e) => handleChange("deliveryNotes", e.target.value)}
                        className="input-premium min-h-[60px] resize-none"
                      />
                    </div>
                  </GlassCard>
                </div>

                <div className="pt-2 space-y-2">
                  <Button 
                    type="submit" 
                    size="full" 
                    disabled={isLoading || !selectedCity || !selectedLocationId} 
                    className="btn-glow gap-2 rounded-2xl h-14 text-base font-bold"
                  >
                    <Lock className="w-5 h-5" strokeWidth={2} />
                    {isLoading ? "Processing..." : `Pay ${formatPriceXAF(listing.price)}`}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="full"
                    onClick={() => setShowRequestForm(false)}
                    className="rounded-2xl"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </GlassCard>
          ) : (
          <Button
            size="full"
            onClick={() => setShowRequestForm(true)}
            className="btn-glow gap-2 rounded-2xl h-14 text-base font-bold animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Shield className="w-5 h-5" strokeWidth={2} />
            Pay Securely
            <ArrowRight className="w-5 h-5" strokeWidth={2} />
          </Button>
          )}

          {/* Seller's Other Posts */}
          {sellerPosts.length > 0 && (
            <section className="space-y-3 animate-fade-up pt-4" style={{ animationDelay: "0.25s" }}>
              <h3 className="text-sm font-bold text-foreground px-1">
                More from {listing.sellerName}
              </h3>
              <div className="space-y-3">
                {sellerPosts.slice(0, 3).map((post) => (
                  <GlassCard
                    key={post.id}
                    variant="interactive"
                    className="p-4"
                    onClick={() => navigate(`/p/${post.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      {post.imageUrl ? (
                        <img src={post.imageUrl} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center">
                          <Package className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{post.title}</p>
                        <p className="text-sm font-bold text-gradient mt-1">{formatPriceXAF(post.price)}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </GlassCard>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
