import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Store, LayoutGrid, HeartHandshake, Settings } from "lucide-react";
import { AFFILIATE_DISCLOSURE } from "./shopConstants";

const LINKS = [
  { to: "/shop", label: "Home", icon: Store, exact: true },
  { to: "/shop/collections", label: "Collections", icon: LayoutGrid },
  { to: "/shop/fund", label: "Community Fund", icon: HeartHandshake },
];

// Top nav + affiliate-disclosure strip shared across all shop pages.
export default function ShopShell({ children, isAdmin }) {
  const { pathname } = useLocation();
  const isActive = (l) => (l.exact ? pathname === l.to : pathname.startsWith(l.to));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/shop" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg,#0066FF,#9D4EDD)" }}>
              <Store className="w-4 h-4" />
            </span>
            The Speakeasy Shop
          </Link>
          <nav className="flex items-center gap-1">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  isActive(l) ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}>
                <l.icon className="w-4 h-4" /> <span className="hidden sm:inline">{l.label}</span>
              </Link>
            ))}
            {isAdmin && (
              <Link to="/shop/admin"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  pathname.startsWith("/shop/admin") ? "bg-purple-600 text-white" : "text-purple-600 hover:bg-purple-50"
                }`}>
                <Settings className="w-4 h-4" /> <span className="hidden sm:inline">Manage</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-slate-400">{AFFILIATE_DISCLOSURE}</p>
        </div>
      </footer>
    </div>
  );
}