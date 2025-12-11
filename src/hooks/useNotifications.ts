import { useState, useEffect, useCallback } from "react";
import { 
  getNotifications, 
  getUserNotifications, 
  getUnreadCount, 
  hasUnreadByType,
  markAsRead,
  markAllAsRead,
  markTypeAsRead,
  Notification 
} from "@/lib/notifications";
import { getSession } from "@/lib/storage";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const session = getSession();
  const userId = session?.id || "";
  const userRole = session?.role || "BUYER_SELLER";

  const refresh = useCallback(() => {
    if (!userId) return;
    
    let userNotifs = getUserNotifications(userId);
    
    // For admins, also include admin notifications
    if (userRole === "ADMIN") {
      const adminNotifs = getNotifications().filter(
        (n) => n.userId === "__ADMIN__" && n.type === "admin"
      );
      userNotifs = [...userNotifs, ...adminNotifs];
    }
    
    setNotifications(userNotifs);
    
    // Calculate unread count
    let unread = getUnreadCount(userId);
    if (userRole === "ADMIN") {
      const adminUnread = getNotifications().filter(
        (n) => n.userId === "__ADMIN__" && !n.read
      ).length;
      unread += adminUnread;
    }
    setUnreadCount(unread);
  }, [userId, userRole]);

  useEffect(() => {
    refresh();
    // Poll for updates every 2 seconds
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  const markRead = useCallback((ids: string[]) => {
    markAsRead(ids);
    refresh();
  }, [refresh]);

  const markAllRead = useCallback(() => {
    markAllAsRead(userId);
    if (userRole === "ADMIN") {
      markAllAsRead("__ADMIN__");
    }
    refresh();
  }, [userId, userRole, refresh]);

  const markTypeRead = useCallback((types: Notification["type"][]) => {
    markTypeAsRead(userId, types);
    if (userRole === "ADMIN" && types.includes("admin")) {
      markTypeAsRead("__ADMIN__", ["admin"]);
    }
    refresh();
  }, [userId, userRole, refresh]);

  // Check for specific badge indicators
  const hasPaymentsBadge = useCallback(() => {
    const types: Notification["type"][] = [];
    if (userRole === "BUYER_SELLER") {
      types.push("seller", "buyer");
    } else if (userRole === "ADMIN") {
      types.push("admin");
    } else if (userRole === "AGENT") {
      types.push("agent");
    }
    
    let hasBadge = hasUnreadByType(userId, types);
    if (userRole === "ADMIN") {
      const adminHas = getNotifications().some(
        (n) => n.userId === "__ADMIN__" && !n.read && n.type === "admin"
      );
      hasBadge = hasBadge || adminHas;
    }
    return hasBadge;
  }, [userId, userRole]);

  return {
    notifications,
    unreadCount,
    hasPaymentsBadge: hasPaymentsBadge(),
    markRead,
    markAllRead,
    markTypeRead,
    refresh,
  };
}
