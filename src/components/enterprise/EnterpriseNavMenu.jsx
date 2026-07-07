import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Home, Store, KeyRound, GitBranch, Brain, Sparkles, LogOut, LogIn, Settings } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";

const GOLD = "#E6C878";

const NAV_TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/marketplace", label: "Marketplace", icon: Store },
  { to: "/dashboard/api-keys", label: "Pipeline Keys", icon: KeyRound },
  { to: "/enterprise?tab=pipelines", label: "Exclusive Pipelines", icon: GitBranch },
  { to: "/enterprise/expertminds", label: "ExpertMinds Enterprise", icon: Brain },
];

/**
 * EnterpriseNavMenu — the user bubble + dropdown for the Sovereign Enterprise
 * masthead. Exposes quick tabs to Home, Marketplace, Pipeline Keys, and the
 * Exclusive Pipelines page, plus account actions.
 */
export default function EnterpriseNavMenu({ user }) {
  const { isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [canSpeakeasy, setCanSpeakeasy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // The Speakeasy is for paying members only — admins always pass.
  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        if (me?.role === "admin") { setCanSpeakeasy(true); return; }
        const subs = await base44.entities.Subscription.filter({ user_id: me.id });
        const sub = subs[0];
        const paying = sub && sub.plan !== "free" && ["active", "trialing", "past_due"].includes(sub.status);
        setCanSpeakeasy(!!paying);
      } catch {
        setCanSpeakeasy(false);
      }
    })();
  }, []);

  const initial = (user?.full_name || user?.email || "S").trim().charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Account"
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border"
        style={{ background: "rgba(200,169,91,0.12)", borderColor: `${GOLD}66`, color: GOLD }}
      >
        {initial}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl py-1 z-[70] backdrop-blur-xl"
          style={{ background: "rgba(10,12,18,0.95)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <div className="px-3 py-2.5 border-b border-white/10">
            <p className="text-xs font-semibold truncate text-white">{user?.full_name || "Sovereign"}</p>
            {user?.email && <p className="text-[10px] truncate text-white/40">{user.email}</p>}
          </div>

          {/* Highlighted Speakeasy — paying members only, gated to the Founder's Room */}
          {canSpeakeasy && (
            <Link
              to="/speakeasy/proxy-room"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 mx-1 my-1 px-2.5 py-2 text-xs font-bold text-[#0A0A0C] rounded-lg bg-gradient-to-r from-[#D9DCE1] to-[#C8A95B] hover:opacity-90 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              The Speakeasy
              <span className="ml-auto text-[8px] font-bold uppercase tracking-wider bg-[#0A0A0C]/15 px-1.5 py-0.5 rounded-full">Platinum</span>
            </Link>
          )}

          {NAV_TABS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <t.icon className="w-3.5 h-3.5" style={{ color: GOLD }} /> {t.label}
            </Link>
          ))}

          <div className="border-t border-white/10 mt-1 pt-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" /> Settings
                </Link>
                <button
                  onClick={() => { setOpen(false); logout(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-white/5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-white/5 transition-colors"
                style={{ color: GOLD }}
              >
                <LogIn className="w-3.5 h-3.5" /> Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}