import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, Package, BarChart2, Key, Settings, ShieldCheck, ChevronDown, TrendingUp, Trophy, DollarSign, Bot, Share2, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/notifications/NotificationBell";
import DevNavChrome from "@/components/nav/DevNavChrome";
import UserMenu from "@/components/nav/UserMenu";
import { base44 } from "@/api/base44Client";

const USER_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/installed", label: "Installed", icon: Package },
  { to: "/dashboard/usage", label: "Usage", icon: BarChart2 },
  { to: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { to: "/dashboard/webhooks", label: "Webhooks", icon: Key },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

// Primary builder tabs — always shown inline. Secondary tabs collapse into a
// "More" dropdown so the bar never needs horizontal scrolling.
const BUILDER_NAV = [
  { to: "/builder", label: "Overview", icon: LayoutDashboard },
  { to: "/builder/components", label: "Components", icon: Package },
  { to: "/builder/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/builder/revenue", label: "Revenue", icon: BarChart2 },
  { to: "/builder/leaderboard", label: "Leaderboard", icon: Trophy },
];

const BUILDER_NAV_MORE = [
  { to: "/builder/trust", label: "Trust", icon: ShieldCheck },
  { to: "/builder/governance", label: "Governance", icon: ShieldCheck },
  { to: "/builder/test-lab", label: "Test Lab", icon: BarChart2 },
  { to: "/builder/analytics-suite", label: "Analytics Suite", icon: TrendingUp },
  { to: "/builder/bob", label: "BOB Builder", icon: Bot },
  { to: "/builder/payout-settings", label: "Payouts", icon: DollarSign },
  { to: "/builder/social", label: "Social", icon: Share2 },
  { to: "/builder/kit-pairing", label: "Kit Pairing", icon: Share2 },
];

export default function SharedNav({ mode = "user", theme }) {
  const location = useLocation();
  // Pages WITHOUT the background video (builder, dashboard, admin, finance, vendor portals)
  // get the IDE/terminal "developer" chrome so tech folks feel at home.
  // Pages WITH the video (Home, Marketplace) don't render SharedNav, so this is safe.
  const autoDev = /^\/(builder|dashboard|admin|finance|vendor|api-partners|spend-intelligence|vendor-scores|speakeasy)/.test(location.pathname);
  const isDev = theme ? theme === "dev" : autoDev;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
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
  const moreItems = mode === "builder" ? BUILDER_NAV_MORE : [];
  const isActive = (path) => location.pathname === path;
  const isMoreActive = moreItems.some((m) => isActive(m.to));

  const navInner = (
    <nav className={`px-4 sm:px-6 py-3 flex items-center gap-2 sticky top-0 z-50 w-full max-w-full ${isDev ? "bg-[#0d1117]" : "bg-white border-b border-slate-100"}`}>
        {/* Logo */}
        <div className="shrink-0 flex items-center gap-2">
          <Logo className="h-8 w-auto" variant={isDev ? "purple" : "white"} />
          {isDev && <span className="hidden lg:inline text-[11px] font-mono text-[#3fb950]">$ _</span>}
        </div>

        {/* Desktop nav links — primary tabs inline + a "More" dropdown so the bar never overflows */}
        <div className="hidden md:flex items-center gap-1 flex-1 min-w-0 [&>a]:shrink-0">
          {navItems.map(({ to, label }) => (
            <Link key={to} to={to}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${isDev
                ? `font-mono ${isActive(to) ? "text-[#3fb950] bg-[#161b22]" : "text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]"}`
                : `font-medium ${isActive(to) ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}`}>
              {isDev && <span className="text-[#484f58]">/</span>}{label}
            </Link>
          ))}

          {/* More dropdown — holds secondary builder tabs */}
          {moreItems.length > 0 && (
            <div className="relative shrink-0">
              <button onClick={() => setMoreOpen((v) => !v)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${isDev
                  ? `font-mono ${isMoreActive || moreOpen ? "text-[#3fb950] bg-[#161b22]" : "text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]"}`
                  : `font-medium ${isMoreActive || moreOpen ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}`}>
                More <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-[55]" onClick={() => setMoreOpen(false)} />
                  <div className={`absolute left-0 mt-1 w-52 rounded-xl shadow-lg py-1 z-[60] ${isDev ? "bg-[#161b22] border border-[#30363d] font-mono" : "bg-white border border-slate-200"}`}>
                    {moreItems.map(({ to, label, icon: Icon }) => (
                      <Link key={to} to={to} onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 text-xs transition-colors ${isDev
                          ? `${isActive(to) ? "text-[#3fb950] bg-[#0d1117]" : "text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#0d1117]"}`
                          : `${isActive(to) ? "text-violet-700 font-semibold bg-slate-50" : "text-slate-600 hover:bg-slate-50"}`}`}>
                        <Icon className="w-3.5 h-3.5" /> {label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationBell isDev={isDev} />

          {/* Portal switcher */}
          <div className="relative hidden sm:block">
            <button onClick={() => setPortalOpen(!portalOpen)}
              className={`flex items-center gap-1.5 text-xs font-bold rounded-lg px-3 py-1.5 transition-all ${isDev ? "font-mono text-[#3fb950] border border-[#3fb950]/40 hover:border-[#3fb950] bg-[#161b22]" : "text-violet-700 border border-violet-300 hover:border-violet-400 bg-violet-50 hover:bg-violet-100"}`}>
              {isDev && <span className="text-[#3fb950]">~/</span>}{mode === "builder" ? "Builder Portal" : "User Portal"}
              <ChevronDown className="w-3 h-3" />
            </button>
            {portalOpen && (
              <>
              <div className="fixed inset-0 z-[55]" onClick={() => setPortalOpen(false)} />
              <div className={`absolute right-0 mt-1 w-44 rounded-xl shadow-lg py-1 z-[60] ${isDev ? "bg-[#161b22] border border-[#30363d] [&_a]:!text-[#8b949e] [&_a:hover]:!bg-[#0d1117] [&_a:hover]:!text-[#c9d1d9] font-mono" : "bg-white border border-slate-200"}`}>
                {/* Highlighted Speakeasy — paying members only, gated to the Founder's Room */}
                {canSpeakeasy && (
                  <Link to="/speakeasy/proxy-room" onClick={() => setPortalOpen(false)}
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
                <Link to="/enterprise" onClick={() => setPortalOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                  Enterprise
                </Link>
                <Link to="/enterprise/expertminds" onClick={() => setPortalOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                  ExpertMinds Enterprise
                </Link>
                <div className="border-t border-slate-100 my-1" />
                <Link to="/admin/upkeeper" onClick={() => setPortalOpen(false)}
                  className="flex items-center gap-2 mx-1 my-1 px-2.5 py-2 text-xs font-bold text-[#0A0A0C] rounded-lg bg-gradient-to-r from-orange-200 to-orange-400 hover:opacity-90 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> The UpKeeper
                </Link>
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
              </>
            )}
          </div>

          {/* Avatar dropdown — always has a Log out option */}
          <UserMenu isDev={isDev} />

          {/* Mobile menu button */}
          <button className={`md:hidden p-1.5 rounded-lg ${isDev ? "text-[#8b949e] hover:bg-[#161b22]" : "hover:bg-slate-100"}`} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>
  );

  return (
    <>
      {isDev ? <DevNavChrome pathLabel={mode === "builder" ? "~/builder" : "~/dashboard"}>{navInner}</DevNavChrome> : navInner}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[70] bg-black/20" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 left-0 right-0 max-h-[calc(100vh-3.5rem)] overflow-y-auto bg-white border-b border-slate-100 py-2 px-4 space-y-1 shadow-xl" onClick={e => e.stopPropagation()}>
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive(to) ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600"}`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
            {/* Secondary builder tabs (the desktop "More" dropdown) — must appear in the mobile drawer too, otherwise BOB Builder & others are unreachable on phones */}
            {moreItems.map(({ to, label, icon: Icon }) => (
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