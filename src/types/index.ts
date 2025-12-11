// Verification Status
export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED";

// User Roles
export type UserRole = "BUYER_SELLER" | "ADMIN" | "AGENT";

// User
export type User = {
  id: string;
  name: string;
  email: string;
  city?: string;
  avatar?: string;
  verified: boolean;
  isVerified?: boolean;
  verificationStatus: VerificationStatus;
  hasPin: boolean;
  pin?: string;
  role?: UserRole;
  createdAt: string;
};

// Post Status
export type PostStatus = "DRAFT" | "PUBLISHED";

// AI History Item
export type AIHistoryItem = {
  id: string;
  type: "improve" | "shorten" | "catchy" | "fr" | "pidgin" | "trust";
  suggestion: string;
  used: boolean;
  createdAt: string;
};

// Post
export type Post = {
  id: string;
  title: string;
  priceXAF: number;
  caption: string;
  photos: string[];
  preOrder: boolean;
  expectedArrival?: string;
  deliveryFeeXAF?: number;
  status: PostStatus;
  sellerId: string;
  aiHistory: AIHistoryItem[];
  createdAt: string;
  updatedAt: string;
};

// Transaction Status
export type TransactionStatus =
  | "pending_setup"
  | "awaiting_payment"
  | "escrow_held"
  | "in_transit_to_hub"
  | "at_prolist_hub"
  | "out_for_delivery"
  | "delivered_awaiting_confirmation"
  | "completed"
  | "refunded";

// Transaction
export type Transaction = {
  id: string;
  postId?: string;
  sellerId: string;
  buyerId?: string;
  buyerName?: string;
  buyerPhone?: string;
  deliveryCity?: string;
  deliveryAddress?: string;
  amountXAF: number;
  deliveryFeeXAF?: number;
  preOrder: boolean;
  expectedArrival?: string;
  status: TransactionStatus;
  assignedAgentId?: string;
  assignedAgentName?: string;
  otp?: string;
  createdAt: string;
  updatedAt: string;
};

// Smart Share
export type SmartShareVariation = {
  text: string;
};

export type SmartShareHistory = {
  id: string;
  postId: string;
  mode: string;
  variations: SmartShareVariation[];
  createdAt: string;
};

// Session
export type Session = User & {
  sessionToken?: string;
};
