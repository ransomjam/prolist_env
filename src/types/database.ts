// Database types matching Supabase schema

export type UserRole = 'BUYER' | 'SELLER' | 'AGENT' | 'ADMIN';

export type TransactionStatus = 
  | 'PENDING_PAYMENT'
  | 'ESCROW_HELD'
  | 'IN_TRANSIT_TO_HUB'
  | 'AT_PROLIST_HUB'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED_AWAITING_CONFIRMATION'
  | 'COMPLETED'
  | 'REFUNDED'
  | 'CANCELLED';

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type PostVisibility = 'PUBLIC' | 'PRIVATE';

export type VerificationFileType = 'id_card' | 'selfie';

// Profile type
export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
  verification_status: VerificationStatus;
  pin_hash: string | null;
  created_at: string;
  updated_at: string;
}

// User role type
export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

// Post type
export interface Post {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  visibility: PostVisibility;
  category: string | null;
  condition: string | null;
  caption_history: CaptionHistoryItem[];
  created_at: string;
  updated_at: string;
  // Joined fields
  seller?: Profile;
}

export interface CaptionHistoryItem {
  caption: string;
  style: string;
  created_at: string;
}

// Transaction type
export interface Transaction {
  id: string;
  buyer_id: string | null;
  seller_id: string;
  post_id: string | null;
  amount: number;
  status: TransactionStatus;
  delivery_location: string | null;
  delivery_address: string | null;
  buyer_phone: string | null;
  assigned_agent_id: string | null;
  otp_code: string | null;
  otp_expires_at: string | null;
  escrow_held_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  buyer?: Profile;
  seller?: Profile;
  post?: Post;
  agent?: Profile;
}

// Verification file type
export interface VerificationFile {
  id: string;
  user_id: string;
  type: VerificationFileType;
  file_url: string;
  created_at: string;
}

// Delivery log type
export interface DeliveryLog {
  id: string;
  transaction_id: string;
  agent_id: string | null;
  note: string | null;
  status: TransactionStatus | null;
  created_at: string;
  // Joined
  agent?: Profile;
}

// Referral type
export interface Referral {
  id: string;
  user_id: string;
  code: string;
  referred_count: number;
  created_at: string;
}

// Notification type
export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: string | null;
  read: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

// Auth context type
export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
  roles: UserRole[];
  primaryRole: UserRole;
}

// Transaction status display info
export const TRANSACTION_STATUS_INFO: Record<TransactionStatus, { label: string; color: string; description: string }> = {
  PENDING_PAYMENT: { 
    label: 'Pending Payment', 
    color: 'bg-yellow-500', 
    description: 'Waiting for buyer to complete payment' 
  },
  ESCROW_HELD: { 
    label: 'Payment Secured', 
    color: 'bg-blue-500', 
    description: 'Payment held securely. Seller preparing item.' 
  },
  IN_TRANSIT_TO_HUB: { 
    label: 'In Transit to Hub', 
    color: 'bg-orange-500', 
    description: 'Item on the way to ProList Hub' 
  },
  AT_PROLIST_HUB: { 
    label: 'At ProList Hub', 
    color: 'bg-purple-500', 
    description: 'Item received at hub, awaiting delivery assignment' 
  },
  OUT_FOR_DELIVERY: { 
    label: 'Out for Delivery', 
    color: 'bg-cyan-500', 
    description: 'Agent is delivering to you' 
  },
  DELIVERED_AWAITING_CONFIRMATION: { 
    label: 'Confirm Delivery', 
    color: 'bg-amber-500', 
    description: 'Item delivered. Please confirm receipt.' 
  },
  COMPLETED: { 
    label: 'Completed', 
    color: 'bg-green-500', 
    description: 'Transaction complete. Payment released.' 
  },
  REFUNDED: { 
    label: 'Refunded', 
    color: 'bg-red-500', 
    description: 'Payment has been refunded' 
  },
  CANCELLED: { 
    label: 'Cancelled', 
    color: 'bg-gray-500', 
    description: 'Transaction was cancelled' 
  },
};

// Delivery locations
export const DELIVERY_LOCATIONS = [
  { id: 'bamenda-city-chemist', name: 'Bamenda City Chemist', address: 'City Chemist Area, Bamenda' },
  { id: 'bambili', name: 'Bambili', address: 'Bambili Town' },
  { id: 'mile-2-nkwen', name: 'Mile 2 Nkwen', address: 'Mile 2, Nkwen' },
  { id: 'moghamo-express', name: 'Agency: Moghamo Express', address: 'Mile 4, City Chemist' },
  { id: 'nso-boys-express', name: 'Agency: Nso Boys Express', address: 'Bambui, Mile 4' },
];

export const PROLIST_CONTACT = {
  name: 'Jam Ransom',
  phone: '+237 671 308 991',
  hours: '8:00 – 18:00 (Tue–Sat)',
  pickupNote: 'Our Agents will handle collection to ProList Warehouse',
};
