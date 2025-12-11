export interface Post {
  id: string;
  title: string;
  description: string;
  price: number;
  category?: string;
  otherCategoryDetail?: string;
  imageUrl?: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  // Pre-order fields
  isPreOrder?: boolean;
  expectedArrival?: string;
  preOrderNote?: string;
  deliveryInfo?: string;
}

// Alias for backwards compatibility
export type Listing = Post;

export interface ListingCategory {
  id: string;
  name: string;
  icon: string;
}

export const LISTING_CATEGORIES: ListingCategory[] = [
  { id: "electronics", name: "Electronics", icon: "📱" },
  { id: "fashion", name: "Fashion", icon: "👕" },
  { id: "home", name: "Home & Garden", icon: "🏠" },
  { id: "vehicles", name: "Vehicles", icon: "🚗" },
  { id: "other", name: "Other", icon: "📦" },
];
