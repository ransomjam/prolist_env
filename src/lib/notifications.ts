import { Transaction, TransactionStatus, UserRole } from "@/types/transaction";
import { getSession } from "./storage";

const STORAGE_KEY = "prolist_notifications";
const MAX_NOTIFICATIONS = 10;

export interface Notification {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
  userId: string;
  transactionId?: string;
  type: "seller" | "buyer" | "admin" | "agent";
}

// Get all notifications
export function getNotifications(): Notification[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Get notifications for current user
export function getUserNotifications(userId: string): Notification[] {
  return getNotifications().filter((n) => n.userId === userId);
}

// Get unread count for user
export function getUnreadCount(userId: string): number {
  return getUserNotifications(userId).filter((n) => !n.read).length;
}

// Check if user has unread notifications of specific types
export function hasUnreadByType(userId: string, types: Notification["type"][]): boolean {
  return getUserNotifications(userId).some((n) => !n.read && types.includes(n.type));
}

// Save notification
export function saveNotification(notification: Omit<Notification, "id" | "createdAt" | "read">): Notification {
  const notifications = getNotifications();
  
  // Check for duplicate (same message, same user, within last minute)
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
  const isDuplicate = notifications.some(
    (n) => n.userId === notification.userId && 
           n.message === notification.message && 
           n.createdAt > oneMinuteAgo
  );
  
  if (isDuplicate) {
    return notifications.find(
      (n) => n.userId === notification.userId && n.message === notification.message
    )!;
  }
  
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  
  // Add to beginning
  notifications.unshift(newNotification);
  
  // Keep only last MAX per user
  const userNotifications = notifications.filter((n) => n.userId === notification.userId);
  const otherNotifications = notifications.filter((n) => n.userId !== notification.userId);
  
  const trimmedUser = userNotifications.slice(0, MAX_NOTIFICATIONS);
  const final = [...trimmedUser, ...otherNotifications];
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(final));
  
  return newNotification;
}

// Mark notifications as read
export function markAsRead(notificationIds: string[]): void {
  const notifications = getNotifications();
  const updated = notifications.map((n) => 
    notificationIds.includes(n.id) ? { ...n, read: true } : n
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// Mark all user notifications as read
export function markAllAsRead(userId: string): void {
  const notifications = getNotifications();
  const updated = notifications.map((n) => 
    n.userId === userId ? { ...n, read: true } : n
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// Mark notifications by type as read
export function markTypeAsRead(userId: string, types: Notification["type"][]): void {
  const notifications = getNotifications();
  const updated = notifications.map((n) => 
    n.userId === userId && types.includes(n.type) ? { ...n, read: true } : n
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// Get notification message for status change
interface StatusNotification {
  message: string;
  type: Notification["type"];
  targetUserId: string;
}

export function getStatusNotifications(
  transaction: Transaction,
  newStatus: TransactionStatus,
  currentUserId: string
): StatusNotification[] {
  const notifications: StatusNotification[] = [];
  
  // Seller notifications
  if (transaction.sellerId && transaction.sellerId !== currentUserId) {
    if (newStatus === "escrow_held") {
      notifications.push({
        message: "Secure payment received — prepare for delivery.",
        type: "seller",
        targetUserId: transaction.sellerId,
      });
    }
    if (newStatus === "at_prolist_hub") {
      notifications.push({
        message: "Item received at ProList Hub.",
        type: "seller",
        targetUserId: transaction.sellerId,
      });
    }
    if (newStatus === "completed") {
      notifications.push({
        message: "Buyer confirmed delivery — payment released securely.",
        type: "seller",
        targetUserId: transaction.sellerId,
      });
    }
  }
  
  // Buyer notifications
  if (transaction.buyerId && transaction.buyerId !== currentUserId) {
    if (newStatus === "out_for_delivery") {
      notifications.push({
        message: "Your item is out for delivery.",
        type: "buyer",
        targetUserId: transaction.buyerId,
      });
    }
    if (newStatus === "delivered_awaiting_confirmation") {
      notifications.push({
        message: "Item delivered — please confirm you received it.",
        type: "buyer",
        targetUserId: transaction.buyerId,
      });
    }
  }
  
  // Admin notifications (notify all admins)
  if (newStatus === "in_transit_to_hub") {
    notifications.push({
      message: "New item in transit — update when received at hub.",
      type: "admin",
      targetUserId: "__ADMIN__", // Special marker for admin
    });
  }
  
  // Agent notifications
  if (transaction.assignedAgentId && newStatus === "out_for_delivery") {
    notifications.push({
      message: "New delivery assigned to you.",
      type: "agent",
      targetUserId: transaction.assignedAgentId,
    });
  }
  
  return notifications;
}

// Create notifications for a status change
export function notifyStatusChange(
  transaction: Transaction,
  newStatus: TransactionStatus
): void {
  const session = getSession();
  if (!session) return;
  
  const statusNotifications = getStatusNotifications(transaction, newStatus, session.id);
  
  statusNotifications.forEach((sn) => {
    // For admin notifications, we'd need to notify all admins
    // For now, we'll handle this in the UI by checking role
    saveNotification({
      message: sn.message,
      type: sn.type,
      userId: sn.targetUserId,
      transactionId: transaction.id,
    });
  });
}

// Check if there's a pending action for buyer
export function hasPendingBuyerAction(userId: string, transactions: Transaction[]): Transaction | null {
  return transactions.find(
    (t) => t.buyerId === userId && t.status === "delivered_awaiting_confirmation"
  ) || null;
}
