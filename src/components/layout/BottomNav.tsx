import { Home, ShoppingBag, Bell, User, Plus } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";

const navItems = [
  { to: "/home", icon: Home, label: "Home", badgeKey: null },
  { to: "/payments", icon: ShoppingBag, label: "Orders", badgeKey: "payments" },
  { to: "/notifications", icon: Bell, label: "Alerts", badgeKey: "notifications" },
  { to: "/profile", icon: User, label: "Profile", badgeKey: null },
];

export function BottomNav() {
  const { hasPaymentsBadge, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const getBadge = (badgeKey: string | null) => {
    if (badgeKey === "payments") return hasPaymentsBadge;
    if (badgeKey === "notifications") return unreadCount > 0;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        {navItems.slice(0, 2).map((item) => {
          const showBadge = getBadge(item.badgeKey);
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                  isActive
                    ? "text-ocean"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors relative",
                    isActive && "bg-ocean/10"
                  )}>
                    <item.icon
                      className="w-5 h-5"
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                    {showBadge && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card animate-pulse" />
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px]",
                    isActive ? "font-semibold" : "font-medium"
                  )}>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* Center Plus Button */}
        <button
          onClick={() => navigate("/posts/new")}
          className="flex flex-col items-center justify-center -mt-6"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-ocean via-teal to-primary flex items-center justify-center shadow-lg shadow-ocean/30 hover:opacity-90 transition-opacity">
            <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
        </button>

        {navItems.slice(2).map((item) => {
          const showBadge = getBadge(item.badgeKey);
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                  isActive
                    ? "text-ocean"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors relative",
                    isActive && "bg-ocean/10"
                  )}>
                    <item.icon
                      className="w-5 h-5"
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                    {showBadge && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card animate-pulse" />
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px]",
                    isActive ? "font-semibold" : "font-medium"
                  )}>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}