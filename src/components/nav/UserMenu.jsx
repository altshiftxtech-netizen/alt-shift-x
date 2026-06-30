import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { LogOut, User as UserIcon, Settings, LogIn } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import StandingBadge from "@/components/speakeasy/social/StandingBadge";

/**
 * UserMenu — the avatar in the top-right of SharedNav, now a working dropdown.
 * Always exposes a Log out option (or Sign in when not authenticated).
 * Respects the dev/light theme via the isDev prop.
 */
export default function UserMenu({ isDev = false }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initial = (user?.full_name || user?.email || "U").trim().charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Account"
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
          isDev
            ? "bg-[#161b22] border border-[#30363d] text-[#3fb950] font-mono hover:border-[#3fb950]"
            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
        }`}
      >
        {initial}
      </button>

      {open && (
        <div
          className={`absolute right-0 mt-1 w-52 rounded-xl shadow-lg py-1 z-[70] ${
            isDev ? "bg-[#161b22] border border-[#30363d] font-mono" : "bg-white border border-slate-200"
          }`}
        >
          {isAuthenticated ? (
            <>
              <div className={`px-3 py-2 border-b ${isDev ? "border-[#30363d]" : "border-slate-100"}`}>
                <p className={`text-xs font-semibold truncate ${isDev ? "text-[#c9d1d9]" : "text-slate-900"}`}>
                  {user?.full_name || "Account"}
                </p>
                {user?.email && (
                  <p className={`text-[10px] truncate ${isDev ? "text-[#8b949e]" : "text-slate-500"}`}>{user.email}</p>
                )}
                <div className="mt-1.5"><StandingBadge /></div>
              </div>
              <Link
                to="/dashboard/settings"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                  isDev ? "text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#0d1117]" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Settings className="w-3.5 h-3.5" /> Settings
              </Link>
              <button
                onClick={() => { setOpen(false); logout(); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                  isDev ? "text-red-400 hover:bg-[#0d1117]" : "text-red-600 hover:bg-red-50"
                }`}
              >
                <LogOut className="w-3.5 h-3.5" /> Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                isDev ? "text-[#3fb950] hover:bg-[#0d1117]" : "text-violet-700 hover:bg-slate-50"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign in
            </Link>
          )}
        </div>
      )}
    </div>
  );
}