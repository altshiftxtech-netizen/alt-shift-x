import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import MobileDevDashboard from "@/components/mobile/MobileDevDashboard";
import MobileBuilderDashboard from "@/components/mobile/MobileBuilderDashboard";
import MobileApiKeys from "@/components/mobile/MobileApiKeys";
import MobileComponents from "@/components/mobile/MobileComponents";
import { LayoutDashboard, Package, Key, User, Hammer } from "lucide-react";

const TABS = [
  { id: "dev", label: "Dashboard", icon: LayoutDashboard, mode: "developer" },
  { id: "keys", label: "API Keys", icon: Key, mode: "developer" },
  { id: "builder", label: "Builder", icon: Hammer, mode: "builder" },
  { id: "components", label: "Components", icon: Package, mode: "builder" },
];

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState("dev");
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case "dev": return <MobileDevDashboard user={user} />;
      case "keys": return <MobileApiKeys />;
      case "builder": return <MobileBuilderDashboard user={user} />;
      case "components": return <MobileComponents />;
      default: return <MobileDevDashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <img
            src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/f652c13a0_AltShiftXLogo.png"
            alt="Alt+Shift+X"
            className="h-6 w-auto"
          />
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:block">{user.full_name || user.email}</span>
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
              {(user.full_name || user.email || "U")[0].toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {renderTab()}
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white border-t border-slate-100 z-30">
        <div className="flex">
          {TABS.map(({ id, label, icon: TabIcon, mode }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-colors ${
                activeTab === id
                  ? mode === "builder"
                    ? "text-violet-700"
                    : "text-blue-600"
                  : "text-slate-400"
              }`}
            >
              <TabIcon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
        {/* Safe area spacer for iOS */}
        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}