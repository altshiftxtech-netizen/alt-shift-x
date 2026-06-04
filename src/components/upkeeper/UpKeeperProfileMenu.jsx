import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, ShieldCheck, Activity, Sparkles, Trophy,
  LogOut, ChevronDown, Bot, BarChart3, User as UserIcon,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

// Profile icon dropdown for The UpKeeper header. Gives admins/staff quick access
// to the key portals + a working Log Out. Replaces the dead "U" avatar.
const LINKS = [
  { to: "/admin", label: "Admin Panel", icon: LayoutDashboard },
  { to: "/admin/intelligence", label: "Platform Intelligence", icon: BarChart3 },
  { to: "/admin/security", label: "Security Center", icon: ShieldCheck },
  { to: "/admin/health", label: "System Health", icon: Activity },
  { to: "/admin/gamification", label: "Gamification", icon: Trophy },
  { to: "/builder/bob", label: "BOB Builder", icon: Bot },
  { to: "/dashboard", label: "User Dashboard", icon: Sparkles },
];

export default function UpKeeperProfileMenu({ user }) {
  const [open, setOpen] = useState(false);
  const initial = (user?.full_name || user?.email || "U").charAt(0).toUpperCase();

  const logout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 bg-[#241812] hover:bg-[#3a2a24] border border-orange-900/40 hover:border-orange-500 rounded-full pl-1 pr-2 py-1 transition-all">
        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-xs font-bold">{initial}</span>
        <ChevronDown className="w-3 h-3 text-orange-200/60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[55]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#241812] border border-orange-900/40 shadow-2xl py-1.5 z-[60]">
            <div className="px-3 py-2 border-b border-orange-900/40 mb-1 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{initial}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-orange-100 truncate">{user?.full_name || "Operator"}</p>
                <p className="text-[10px] text-orange-200/50 truncate">{user?.email}</p>
              </div>
            </div>
            {LINKS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-orange-200/70 hover:text-white hover:bg-[#3a2a24] transition-colors">
                <Icon className="w-3.5 h-3.5 text-orange-400" /> {label}
              </Link>
            ))}
            <div className="border-t border-orange-900/40 mt-1 pt-1">
              <button onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-300 hover:text-white hover:bg-red-900/40 transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}