import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap, Users, Star, Package, X, LogOut, LogIn, UserPlus } from "lucide-react";
import Logo from "@/components/Logo";
import { setSEOMeta, setBreadcrumbSchema } from "@/lib/seoHelpers";
import { useAuth } from "@/lib/AuthContext";

const FEATURED = [
  { name: "Ironclad Protocol", type: "X1", category: "Risk & Compliance", rating: 4.4, installs: 847, desc: "Extracts and validates all contractual risk indicators from subcontractor agreements." },
  { name: "Estimator's Eye", type: "X2", category: "Project Management", rating: 4.2, installs: 312, desc: "Parses construction bid estimates and extracts division-level costs and alternates." },
  { name: "The Site Board", type: "X4", category: "Site Reporting", rating: 4.7, installs: 203, desc: "Transforms daily site reports into structured workforce and programme impact data." },
];

const STATS = [
  { label: "Components", value: "240+", icon: Package },
  { label: "Builders", value: "80+", icon: Users },
  { label: "Installs", value: "18k+", icon: Zap },
  { label: "Avg Trust Score", value: "91", icon: ShieldCheck },
];

const typeColors = { X1: "bg-violet-100 text-violet-700", X2: "bg-blue-100 text-blue-700", X4: "bg-amber-100 text-amber-700" };

function InstallCTAModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-7 h-7 text-violet-700" />
        </div>
        <h2 className="text-xl font-black text-slate-900 text-center mb-2">Login Required to Install</h2>
        <p className="text-slate-500 text-sm text-center mb-6">
          You need an account to install AI components. Sign up free to get started — it only takes 2 minutes.
        </p>
        <div className="space-y-2">
          <Link to="/register" onClick={onClose}>
            <Button className="w-full bg-violet-700 hover:bg-violet-800 text-white h-11 gap-2">
              <UserPlus className="w-4 h-4" /> Create Free Account
            </Button>
          </Link>
          <Link to="/login" onClick={onClose}>
            <Button variant="outline" className="w-full h-11 gap-2">
              <LogIn className="w-4 h-4" /> Sign In
            </Button>
          </Link>
        </div>
        <p className="text-[11px] text-slate-400 text-center mt-4">No credit card required to sign up</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    setSEOMeta({
      title: "Alt+Shift+X Market — Verified AI Components for Construction Intelligence",
      description: "Discover 240+ verified AI-powered components for construction document extraction, risk analysis, project management, and site reporting. Trusted by enterprises worldwide.",
      keywords: "AI components, construction, document extraction, risk management, project management, site reporting, verified AI, enterprise software",
      robots: "index, follow",
    });
    setBreadcrumbSchema([
      { label: "Home", url: "https://altshiftx.com" }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {showInstallModal && <InstallCTAModal onClose={() => setShowInstallModal(false)} />}
      {/* Nav */}
      <nav className="border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Logo className="h-8 w-auto" />
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/marketplace" className="hover:text-slate-900 dark:hover:text-white">Marketplace</Link>
          <Link to="/builder" className="hover:text-slate-900 dark:hover:text-white">Build</Link>
          <Link to="/dashboard" className="hover:text-slate-900 dark:hover:text-white">Dashboard</Link>
          <Link to="/contact" className="hover:text-slate-900 dark:hover:text-white">Contact</Link>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard"><Button variant="ghost" className="text-sm h-8">Dashboard</Button></Link>
              <Button variant="outline" className="text-sm h-8 gap-1.5" onClick={() => logout()}>
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" className="text-sm h-8 gap-1.5"><LogIn className="w-3.5 h-3.5" /> Sign in</Button></Link>
              <Link to="/register"><Button className="text-sm h-8 bg-slate-900 dark:bg-violet-700 hover:bg-slate-700 dark:hover:bg-violet-600 gap-1.5"><UserPlus className="w-3.5 h-3.5" /> Sign up</Button></Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <ShieldCheck className="w-3.5 h-3.5" /> Trust-scored AI components for construction
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
          The marketplace for<br />
          <span className="text-violet-700 dark:text-violet-400">verified AI components</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10">
          Discover, install, and deploy battle-tested extraction models for construction documents — each one benchmarked, scored, and certified.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link to="/marketplace">
            <Button className="h-11 px-6 bg-slate-900 hover:bg-slate-700 text-sm gap-2">
              Browse Marketplace <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          {isAuthenticated ? (
            <Link to="/builder">
              <Button variant="outline" className="h-11 px-6 text-sm">Start Building</Button>
            </Link>
          ) : (
            <Button variant="outline" className="h-11 px-6 text-sm" onClick={() => setShowInstallModal(true)}>
              Install a Component
            </Button>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-2"><Icon className="w-5 h-5 text-slate-400 dark:text-slate-500" /></div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{value}</div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Components</h2>
          <Link to="/marketplace" className="text-sm text-violet-700 dark:text-violet-400 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURED.map(c => (
            <Link key={c.name} to="/marketplace">
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md dark:hover:shadow-lg transition-shadow bg-white dark:bg-slate-800 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[c.type]}`}>{c.type}</span>
                   <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{c.category}</span>
                 </div>
                 <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{c.name}</h3>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex-1">{c.desc}</p>
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-1 text-xs text-amber-500">
                     <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                     <span className="font-semibold text-slate-700 dark:text-amber-400">{c.rating}</span>
                   </div>
                   <span className="text-xs text-slate-400 dark:text-slate-500">{c.installs.toLocaleString()} installs</span>
                 </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 dark:bg-slate-950 py-16 text-center">
        <h2 className="text-3xl font-black text-white mb-4">Ready to build smarter?</h2>
        <p className="text-slate-400 dark:text-slate-500 mb-8 text-sm">Join 80+ builders shipping verified AI components to construction teams worldwide.</p>
        <Link to="/register">
          <Button className="bg-violet-600 dark:bg-violet-700 hover:bg-violet-700 dark:hover:bg-violet-600 text-white h-11 px-8 text-sm">Create your account</Button>
        </Link>
      </section>

      <footer className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/contact" className="hover:text-slate-600">Contact</Link>
          <Link to="/tutorials" className="hover:text-slate-600">Tutorials</Link>
          <Link to="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-slate-600">Terms of Service</Link>
          <Link to="/sensitive-intelligence-policy" className="hover:text-slate-600">Sensitive Intelligence Policy</Link>
          <Link to="/builder/bob" className="hover:text-slate-600">BOB Builder</Link>
        </div>
        <p>© 2026 Alt+Shift+X. All rights reserved.</p>
      </footer>
    </div>
  );
}