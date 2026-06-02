import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, Package, BarChart2, Key, Settings, ShieldCheck, ChevronDown, TrendingUp, Trophy, DollarSign, Bot, Share2, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { base44 } from "@/api/base44Client";

const USER_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/installed", label: "Installed", icon: Package },
  { to: "/dashboard/usage", label: "Usage", icon: BarChart2 },
  { to: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { to: "/dashboard/webhooks", label: "Webhooks", icon: Key },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const BUILDER_NAV = [
  { to: "/builder", label: "Overview", icon: LayoutDashboard },
  { to: "/builder/components", label: "Components", icon: Package },
  { to: "/builder/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/builder/trust", label: "Trust", icon: ShieldCheck },
  { to: "/builder/governance", label: "Governance", icon: ShieldCheck },
  { to: "/builder/revenue", label: "Revenue", icon: BarChart2 },
  { to: "/builder/test-lab", label: "Test Lab", icon: BarChart2 },
  { to: "/builder/analytics-suite", label: "Analytics Suite", icon: TrendingUp },
  { to: "/builder/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/builder/payout-settings", label: "Payouts", icon: DollarSign },
  { to: "/builder/social", label: "Social", icon: Share2 },
  { to: "/builder/bob", label: "BOB Builder", icon: null, isBob: true },
];

export default function SharedNav({ mode = "user" }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [canSpeakeasy, setCanSpeakeasy] = useState(false);

  // The Speakeasy is for paying builders/developers only — free-tier users don't see it.
  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role === "admin") { setCanSpeakeasy(true); return; }
        const subs = await base44.entities.Subscription.filter({ user_id: user.id });
        const sub = subs[0];
        const isPaying = sub && sub.plan !== "free" && ["active", "trialing", "past_due"].includes(sub.status);
        setCanSpeakeasy(!!isPaying);
      } catch {
        setCanSpeakeasy(false);
      }
    })();
  }, []);

  const navItems = mode === "builder" ? BUILDER_NAV : USER_NAV;
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        {/* Logo */}
        <div className="shrink-0">
          <Logo className="h-8 w-auto" />
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, isBob }) => (
            isBob ? (
              <Link key={to} to={to}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${isActive(to) ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200"}`}>
                <img src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/10a720a09_generated_image.png" className="w-5 h-5 rounded-full object-cover" alt="BOB" />
                {label}
              </Link>
            ) : (
              <Link key={to} to={to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive(to) ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
                {label}
              </Link>
            )
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Portal switcher */}
          <div className="relative hidden sm:block">
            <button onClick={() => setPortalOpen(!portalOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:border-slate-300 transition-all">
              {mode === "builder" ? "Builder Portal" : "User Portal"}
              <ChevronDown className="w-3 h-3" />
            </button>
            {portalOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                {/* Highlighted Speakeasy — paying members only */}
                {canSpeakeasy && (
                  <Link to="/speakeasy" onClick={() => setPortalOpen(false)}
                    className="flex items-center gap-2 mx-1 mb-1 px-2.5 py-2 text-xs font-bold text-[#0A0A0C] rounded-lg bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] hover:opacity-90 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    The Speakeasy
                    <span className="ml-auto text-[8px] font-bold uppercase tracking-wider bg-[#0A0A0C]/15 px-1.5 py-0.5 rounded-full">Platinum</span>
                  </Link>
                )}
                <Link to="/dashboard" onClick={() => setPortalOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 ${mode === "user" ? "text-violet-700 font-semibold" : "text-slate-600"}`}>
                  User Dashboard
                </Link>
                <Link to="/builder" onClick={() => setPortalOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 ${mode === "builder" ? "text-violet-700 font-semibold" : "text-slate-600"}`}>
                  Builder Portal
                </Link>
                <Link to="/marketplace" onClick={() => setPortalOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                  Marketplace
                </Link>
                <Link to="/pricing" onClick={() => setPortalOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                  Pricing
                </Link>
                <Link to="/dashboard/subscription" onClick={() => setPortalOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                  Subscription
                </Link>
                <Link to="/tutorials" onClick={() => setPortalOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                  Tutorials
                </Link>
                <div className="border-t border-slate-100 my-1" />
                <Link to="/admin" onClick={() => setPortalOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                  Admin Panel
                </Link>
                <Link to="/admin/intelligence" onClick={() => setPortalOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                  Platform Intelligence
                </Link>
                <Link to="/admin/gamification" onClick={() => setPortalOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                  Gamification Admin
                </Link>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 cursor-pointer">U</div>

          {/* Mobile menu button */}
          <button className="md:hidden p-1.5 rounded-lg hover:bg-slate-100" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/20" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 left-0 right-0 bg-white border-b border-slate-100 py-2 px-4 space-y-1" onClick={e => e.stopPropagation()}>
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive(to) ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600"}`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
            <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
              {mode === "user"
                ? <Link to="/builder" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600">Builder Portal</Link>
                : <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600">User Dashboard</Link>
              }
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600">Admin Panel</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}