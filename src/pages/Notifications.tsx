import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle, Package, Truck, Wallet, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useNotifications } from "@/hooks/useNotifications";
import { getSession } from "@/lib/storage";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  payment: Wallet,
  delivery: Truck,
  order: Package,
  confirmation: CheckCircle,
};

export default function Notifications() {
  const navigate = useNavigate();
  const session = getSession();
  const { notifications, markAllRead } = useNotifications();

  useEffect(() => {
    if (!session) {
      navigate("/auth/login");
    }
  }, [session, navigate]);

  useEffect(() => {
    // Mark all as read when viewing this page
    if (notifications.length > 0) {
      markAllRead();
    }
  }, []);

  const getIcon = (message: string) => {
    if (message.toLowerCase().includes("payment") || message.toLowerCase().includes("escrow")) {
      return Wallet;
    }
    if (message.toLowerCase().includes("delivery") || message.toLowerCase().includes("transit")) {
      return Truck;
    }
    if (message.toLowerCase().includes("confirm")) {
      return CheckCircle;
    }
    return Package;
  };

  return (
    <div className="min-h-screen page-premium pb-24">
      <TopBar title="Notifications" />

      <main className="relative z-10 p-4 space-y-4">
        {notifications.length === 0 ? (
          <GlassCard className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">No notifications</p>
            <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => {
              const Icon = getIcon(notification.message);
              return (
                <GlassCard
                  key={notification.id}
                  variant="interactive"
                  className={cn(
                    "p-4 animate-fade-up",
                    !notification.read && "border-l-2 border-l-primary"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      notification.read ? "bg-muted" : "bg-primary/10"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        notification.read ? "text-muted-foreground" : "text-primary"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm",
                        notification.read ? "text-muted-foreground" : "text-foreground font-medium"
                      )}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
