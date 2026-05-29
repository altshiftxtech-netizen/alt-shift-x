import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap, Users, Star, Package } from "lucide-react";

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

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
            <span className="text-white text-xs font-black">A</span>
          </div>
          <span className="font-bold text-slate-900 text-sm">Alt+Shift+X</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-500">
          <Link to="/marketplace" className="hover:text-slate-900">Marketplace</Link>
          <Link to="/builder" className="hover:text-slate-900">Build</Link>
          <Link to="/dashboard" className="hover:text-slate-900">Dashboard</Link>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login"><Button variant="ghost" className="text-sm h-8">Sign in</Button></Link>
          <Link to="/register"><Button className="text-sm h-8 bg-slate-900 hover:bg-slate-700">Get started</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <ShieldCheck className="w-3.5 h-3.5" /> Trust-scored AI components for construction
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
          The marketplace for<br />
          <span className="text-violet-700">verified AI components</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">
          Discover, install, and deploy battle-tested extraction models for construction documents — each one benchmarked, scored, and certified.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link to="/marketplace">
            <Button className="h-11 px-6 bg-slate-900 hover:bg-slate-700 text-sm gap-2">
              Browse Marketplace <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/builder">
            <Button variant="outline" className="h-11 px-6 text-sm">Start Building</Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-100 bg-slate-50 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-2"><Icon className="w-5 h-5 text-slate-400" /></div>
              <div className="text-2xl font-black text-slate-900">{value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Featured Components</h2>
          <Link to="/marketplace" className="text-sm text-violet-700 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURED.map(c => (
            <Link key={c.name} to="/marketplace">
              <div className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[c.type]}`}>{c.type}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{c.category}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{c.name}</h3>
                <p className="text-xs text-slate-500 mb-4 flex-1">{c.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    <span className="font-semibold text-slate-700">{c.rating}</span>
                  </div>
                  <span className="text-xs text-slate-400">{c.installs.toLocaleString()} installs</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 py-16 text-center">
        <h2 className="text-3xl font-black text-white mb-4">Ready to build smarter?</h2>
        <p className="text-slate-400 mb-8 text-sm">Join 80+ builders shipping verified AI components to construction teams worldwide.</p>
        <Link to="/register">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white h-11 px-8 text-sm">Create your account</Button>
        </Link>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-400">
        © 2026 Alt+Shift+X. All rights reserved.
      </footer>
    </div>
  );
}