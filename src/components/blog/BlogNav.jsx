import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Menu, X, LogIn } from "lucide-react";

export default function BlogNav() {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const links = [
    { to: "/", label: "Home" },
    { to: "/blog", label: "Blog" },
    { to: "/marketplace", label: "Marketplace" },
    { to: "/pricing", label: "Pricing" },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-sm font-black text-slate-900 tracking-tight">
          Alt+Shift+X
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              {l.label}
            </Link>
          ))}
          {!user && (
            <Link to="/login" className="flex items-center gap-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg transition-colors ml-2">
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </Link>
          )}
        </div>

        <button className="sm:hidden p-1.5 rounded-lg hover:bg-slate-100" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="sm:hidden border-t border-slate-100 px-4 py-2 space-y-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="block text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50">
              {l.label}
            </Link>
          ))}
          {!user && (
            <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm font-bold text-violet-600 px-3 py-2 rounded-lg hover:bg-violet-50">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}