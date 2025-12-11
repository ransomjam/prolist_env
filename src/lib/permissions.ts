import { TransactionStatus, UserRole, Transaction, User } from "@/types/transaction";

/**
 * Centralized permission system for ProList Protect
 * Enforces strict role-based access control
 */

// Valid status transitions per role
const ROLE_TRANSITIONS: Record<UserRole, Record<TransactionStatus, TransactionStatus[]>> = {
  BUYER_SELLER: {
    // Sellers can only mark IN_TRANSIT_TO_HUB from ESCROW_HELD
    escrow_held: ["in_transit_to_hub"],
    // Buyers can only confirm COMPLETED from DELIVERED_AWAITING_CONFIRMATION
    delivered_awaiting_confirmation: ["completed"],
    // No other transitions allowed
    pending_setup: [],
    awaiting_payment: [],
    in_transit_to_hub: [],
    at_prolist_hub: [],
    out_for_delivery: [],
    completed: [],
    refunded: [],
  },
  ADMIN: {
    // Admin can mark AT_PROLIST_HUB from IN_TRANSIT_TO_HUB
    in_transit_to_hub: ["at_prolist_hub"],
    // Admin can assign agent (OUT_FOR_DELIVERY) from AT_PROLIST_HUB
    at_prolist_hub: ["out_for_delivery"],
    // No other transitions
    pending_setup: [],
    awaiting_payment: [],
    escrow_held: [],
    out_for_delivery: [],
    delivered_awaiting_confirmation: [],
    completed: [],
    refunded: [],
  },
  AGENT: {
    // Agent can confirm delivery from OUT_FOR_DELIVERY
    out_for_delivery: ["delivered_awaiting_confirmation"],
    // No other transitions
    pending_setup: [],
    awaiting_payment: [],
    escrow_held: [],
    in_transit_to_hub: [],
    at_prolist_hub: [],
    delivered_awaiting_confirmation: [],
    completed: [],
    refunded: [],
  },
};

// Status progression order (cannot skip)
export const STATUS_ORDER: TransactionStatus[] = [
  "pending_setup",
  "awaiting_payment",
  "escrow_held",
  "in_transit_to_hub",
  "at_prolist_hub",
  "out_for_delivery",
  "delivered_awaiting_confirmation",
  "completed",
];

/**
 * Check if a user can transition a transaction to a new status
 */
export function canTransitionTo(
  user: User | null,
  transaction: Transaction,
  targetStatus: TransactionStatus
): boolean {
  if (!user) return false;

  const role = user.role;
  const currentStatus = transaction.status;

  // Check if this role can make this specific transition
  const allowedTransitions = ROLE_TRANSITIONS[role]?.[currentStatus] || [];
  if (!allowedTransitions.includes(targetStatus)) {
    return false;
  }

  // For BUYER_SELLER role, check if they are the actual seller or buyer
  if (role === "BUYER_SELLER") {
    const isSeller = user.id === transaction.sellerId;
    const isBuyer = user.id === transaction.buyerId || user.phone === transaction.buyerPhone;

    // Seller can only mark in transit
    if (targetStatus === "in_transit_to_hub" && !isSeller) {
      return false;
    }

    // Buyer can only confirm completion
    if (targetStatus === "completed" && !isBuyer) {
      return false;
    }
  }

  // Agent must be assigned to this transaction
  if (role === "AGENT") {
    if (transaction.assignedAgentId !== user.id) {
      return false;
    }
  }

  return true;
}

/**
 * Get the next action available for a user on a transaction
 */
export type TransactionAction = 
  | { type: "seller_ship"; label: string }
  | { type: "admin_receive"; label: string }
  | { type: "admin_assign"; label: string }
  | { type: "agent_deliver"; label: string }
  | { type: "buyer_confirm"; label: string }
  | { type: "waiting"; label: string; waitingFor: string }
  | null;

export function getAvailableAction(
  user: User | null,
  transaction: Transaction
): TransactionAction {
  if (!user) return null;

  const role = user.role;
  const status = transaction.status;
  const isSeller = user.id === transaction.sellerId;
  const isBuyer = user.id === transaction.buyerId || user.phone === transaction.buyerPhone;
  const isAssignedAgent = transaction.assignedAgentId === user.id;

  // Terminal states
  if (status === "completed" || status === "refunded") {
    return null;
  }

  // Pre-payment states
  if (status === "pending_setup" || status === "awaiting_payment") {
    return { type: "waiting", label: "Awaiting Payment", waitingFor: "buyer" };
  }

  // ESCROW_HELD - Only seller can ship
  if (status === "escrow_held") {
    if (role === "BUYER_SELLER" && isSeller) {
      return { type: "seller_ship", label: "Mark In Transit" };
    }
    return { type: "waiting", label: "Waiting for seller to ship", waitingFor: "seller" };
  }

  // IN_TRANSIT_TO_HUB - Only admin can receive
  if (status === "in_transit_to_hub") {
    if (role === "ADMIN") {
      return { type: "admin_receive", label: "Mark Received at Hub" };
    }
    return { type: "waiting", label: "In transit to hub", waitingFor: "admin" };
  }

  // AT_PROLIST_HUB - Only admin can assign agent
  if (status === "at_prolist_hub") {
    if (role === "ADMIN") {
      return { type: "admin_assign", label: "Assign Delivery Agent" };
    }
    return { type: "waiting", label: "At hub, awaiting assignment", waitingFor: "admin" };
  }

  // OUT_FOR_DELIVERY - Only assigned agent can confirm delivery
  if (status === "out_for_delivery") {
    if (role === "AGENT" && isAssignedAgent) {
      return { type: "agent_deliver", label: "Confirm Delivery" };
    }
    return { type: "waiting", label: "Out for delivery", waitingFor: "agent" };
  }

  // DELIVERED_AWAITING_CONFIRMATION - Only buyer can complete
  if (status === "delivered_awaiting_confirmation") {
    if (role === "BUYER_SELLER" && isBuyer) {
      return { type: "buyer_confirm", label: "Confirm Received" };
    }
    return { type: "waiting", label: "Awaiting buyer confirmation", waitingFor: "buyer" };
  }

  return null;
}

/**
 * Check if user can view a transaction
 */
export function canViewTransaction(user: User | null, transaction: Transaction): boolean {
  if (!user) return false;

  // Admin can view all
  if (user.role === "ADMIN") return true;

  // Agent can view assigned deliveries
  if (user.role === "AGENT") {
    return transaction.assignedAgentId === user.id;
  }

  // Buyer/Seller can view their own
  const isSeller = user.id === transaction.sellerId;
  const isBuyer = user.id === transaction.buyerId || user.phone === transaction.buyerPhone;
  return isSeller || isBuyer;
}

/**
 * Check if user can create listings (requires verification for sellers)
 */
export function canCreateListing(user: User | null): boolean {
  if (!user) return false;

  // Admin and Agent bypass verification
  if (user.role === "ADMIN" || user.role === "AGENT") return true;

  // BUYER_SELLER must be verified
  if (user.role === "BUYER_SELLER") {
    return user.verificationStatus === "VERIFIED";
  }

  return false;
}

/**
 * Get role-specific label for transaction status
 */
export function getStatusLabelForRole(
  status: TransactionStatus,
  role: UserRole
): string {
  const labels: Record<TransactionStatus, string> = {
    pending_setup: "Setting Up",
    awaiting_payment: "Awaiting Payment",
    escrow_held: "Payment Secured",
    in_transit_to_hub: "Shipped to Hub",
    at_prolist_hub: "Received at Hub",
    out_for_delivery: "Out for Delivery",
    delivered_awaiting_confirmation: "Delivered - Awaiting Confirmation",
    completed: "Completed",
    refunded: "Refunded",
  };

  return labels[status] || status;
}

/**
 * Denial message when action is not allowed
 */
export const PERMISSION_DENIED_MESSAGE = "Action not allowed — waiting for the previous step to be completed.";
