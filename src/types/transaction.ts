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

export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";

export type UserRole = "BUYER_SELLER" | "ADMIN" | "AGENT";

// Verification Data Model
export interface VerificationData {
  fullName: string;
  city: string;
  nationalIdImage?: string;
  selfieWithIdImage?: string;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

// Invoice Data Model
export interface Invoice {
  invoiceNumber: string;   // PL-YYYY-SEQ e.g. PL-2025-000123
  issuedAt: string;
  sellerName: string;
  sellerPhone?: string;
  sellerCity?: string;
  buyerName: string;
  buyerPhone: string;
  buyerCity?: string;
  itemTitle: string;
  itemPriceXAF: number;
  deliveryFeeXAF?: number;
  totalXAF: number;
  transactionId: string;
  postId: string;
  isPreOrder: boolean;
}

export interface DeliveryDetails {
  city: string;
  address: string;
  notes?: string;
}

export interface LogisticsDetails {
  dropoffCompany?: string;
  dropoffCity?: string;
  dropoffNote?: string;
}

export interface Transaction {
  id: string;
  postId?: string;
  productName: string;
  description?: string;
  price: number;
  deliveryFee: number;
  sellerName: string;
  sellerPhone: string;
  sellerId: string;
  buyerId?: string;
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  buyerCity?: string;
  deliveryLocation: string;
  deliveryArea: string;
  delivery?: DeliveryDetails;
  logistics?: LogisticsDetails;
  assignedAgentId?: string;
  assignedAgentName?: string;
  status: TransactionStatus;
  isPreOrder: boolean;
  expectedArrival?: string;
  preOrderNote?: string;
  createdAt: string;
  updatedAt: string;
  paymentLink: string;
  confirmationCode: string;
  buyerTrackingLink?: string;
  invoice?: Invoice;
  // OTP for delivery confirmation
  deliveryOTP?: string;
}

export interface SmartShareVariation {
  text: string;
}

export interface SmartShareHistory {
  transactionId?: string;
  postId?: string;
  productName: string;
  variations: SmartShareVariation[];
  createdAt: string;
}

export interface User {
  id: string;
  phone: string;
  email: string;
  name: string;
  city?: string;
  pin?: string;
  hasPin?: boolean;
  isVerified: boolean;
  verificationStatus?: VerificationStatus;
  verificationData?: VerificationData;
  role: UserRole;
  createdAt: string;
}
