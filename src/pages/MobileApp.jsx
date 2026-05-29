import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import MobileDevDashboard from "@/components/mobile/MobileDevDashboard";
import MobileBuilderDashboard from "@/components/mobile/MobileBuilderDashboard";
import MobileApiKeys from "@/components/mobile/MobileApiKeys";
import MobileComponents from "@/components/mobile/MobileComponents";
import MobileNotifications from "@/components/mobile/MobileNotifications";
import MobileAlertSettings from "@/components/mobile/MobileAlertSettings";
import { LayoutDashboard, Package, Key, Hammer, Bell } from "lucide-react";

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState("dev");
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAlertSettings, setShowAlertSettings] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Live unread badge
  useEffect(() => {
    if (!user?.id) return;
    base44.entities.AppNotification.filter({ user_id: user.id, read: false }, "-created_date", 50)
      .then(data => setUnreadCount((data || []).length))
      .catch(() => {});

    const unsub = base44.entities.AppNotification.subscribe((event) => {
      if (event.data?.user_id !== user.id) return;
      base44.entities.AppNotification.filter({ user_id: user.id, read: false }, "-created_date", 50)
        .then(data => setUnreadCount((data || []).length))
        .catch(() => {});
    });
    return unsub;
  }, [user?.id]);

  const TABS = [
    { id: "dev", label: "Dashboard", icon: LayoutDashboard, mode: "developer" },
    { id: "keys", label: "API Keys", icon: Key, mode: "developer" },
    { id: "builder", label: "Builder", icon: Hammer, mode: "builder" },
    { id: "components", label: "Components", icon: Package, mode: "builder" },
    { id: "alerts", label: "Alerts", icon: Bell, mode: "alerts", badge: unreadCount },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "dev": return <MobileDevDashboard user={user} />;
      case "keys": return <MobileApiKeys />;
      case "builder": return <MobileBuilderDashboard user={user} />;
      case "components": return <MobileComponents />;
      case "alerts": return <MobileNotifications user={user} onOpenSettings={() => setShowAlertSettings(true)} />;
      default: return <MobileDevDashboard user={user} />;
    }
  };

  const tabColor = (tab) => {
    if (activeTab !== tab.id) return "text-slate-400";
    if (tab.mode === "builder") return "text-violet-700";
    if (tab.mode === "alerts") return "text-red-500";
    return "text-blue-600";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <img
          src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/f652c13a0_AltShiftXLogo.png"
          alt="Alt+Shift+X"
          className="h-6 w-auto"
        />
        <div className="flex items-center gap-3">
          {/* Alert bell shortcut */}
          <button
            onClick={() => setActiveTab("alerts")}
            className="relative p-1.5 text-slate-400 hover:text-slate-700"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {user && (
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
              {(user.full_name || user.email || "U")[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {renderTab()}
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white border-t border-slate-100 z-30 safe-area-bottom">
        <div className="flex">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-3 px-1 transition-colors relative ${tabColor(tab)}`}
              >
                <div className="relative">
                  <TabIcon className="w-5 h-5" />
                  {tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                      {tab.badge > 9 ? "9+" : tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div className="h-4" />
      </div>

      {/* Alert settings sheet */}
      {showAlertSettings && (
        <MobileAlertSettings
          user={user}
          onClose={() => setShowAlertSettings(false)}
        />
      )}
    </div>
  );
}