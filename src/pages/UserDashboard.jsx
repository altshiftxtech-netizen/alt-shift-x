import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Zap, ShieldCheck, ArrowRight, Star, BarChart2, Settings } from "lucide-react";

const INSTALLED = [
  { id: "ironclad-protocol", name: "Ironclad Protocol", code: "RP-CONSTRUCTION-1.0", type: "X1", trustScore: 91, callsThisMonth: 1240, lastUsed: "2 hours ago", status: "active" },
  { id: "the-site-board", name: "The Site Board", code: "RC-CONSTRUCTION", type: "X4", trustScore: 93, callsThisMonth: 876, lastUsed: "Yesterday", status: "active" },
  { id: "estimators-eye", name: "Estimator's Eye", code: "PM-CONSTRUCTION-BID", type: "X2", trustScore: 87, callsThisMonth: 334, lastUsed: "3 days ago", status: "active" },
];

const typeColors = { X1: "bg-violet-100 text-violet-700", X2: "bg-blue-100 text-blue-700", X4: "bg-amber-100 text-amber-700" };

const STATS = [
  { label: "Installed Components", value: "3", icon: Package, color: "text-violet-600" },
  { label: "API Calls This Month", value: "2,450", icon: Zap, color: "text-blue-600" },
  { label: "Avg Trust Score", value: "90.3", icon: ShieldCheck, color: "text-emerald-600" },
];

const RECENT_ACTIVITY = [
  { action: "Extraction run", component: "Ironclad Protocol", time: "2 hours ago", docs: 12 },
  { action: "Extraction run", component: "The Site Board", time: "Yesterday", docs: 45 },
  { action: "Extraction run", component: "Ironclad Protocol", time: "2 days ago", docs: 8 },
  { action: "Component installed", component: "Estimator's Eye", time: "3 days ago", docs: null },
];

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center"><span className="text-white text-xs font-black">A</span></div>
          <span className="font-bold text-slate-900 text-sm">Alt+Shift+X</span>
        </Link>
        <div className="hidden md:flex items-center gap-5 text-sm text-slate-500">
          <Link to="/dashboard" className="text-slate-900 font-semibold">Dashboard</Link>
          <Link to="/dashboard/installed" className="hover:text-slate-900">Installed</Link>
          <Link to="/dashboard/usage" className="hover:text-slate-900">Usage</Link>
          <Link to="/marketplace" className="hover:text-slate-900">Marketplace</Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">U</div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Dashboard</h1>
            <p className="text-sm text-slate-400">Welcome back — here's your component activity</p>
          </div>
          <Link to="/marketplace">
            <Button className="bg-violet-700 hover:bg-violet-800 text-white text-sm h-9 gap-2">
              <Package className="w-4 h-4" /> Browse Marketplace
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="pt-5 flex items-center gap-4">
                <div className={`p-2 rounded-xl bg-slate-100 ${color}`}><Icon className="w-5 h-5" /></div>
                <div>
                  <p className="text-xl font-black text-slate-900">{value}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Installed components */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Installed Components</h2>
              <Link to="/dashboard/installed" className="text-xs text-violet-700 hover:underline flex items-center gap-0.5">Manage <ArrowRight className="w-3 h-3" /></Link>
            </div>
            {INSTALLED.map(c => (
              <Card key={c.id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[c.type]}`}>{c.type}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{c.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{c.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-slate-500">
                    <div className="hidden sm:block text-right">
                      <p className="font-semibold text-slate-700">{c.callsThisMonth.toLocaleString()}</p>
                      <p className="text-slate-400">calls this month</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400">Last used</p>
                      <p className="font-semibold text-slate-700">{c.lastUsed}</p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />{c.trustScore}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent activity */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-3">Recent Activity</h2>
            <Card>
              <CardContent className="pt-4 divide-y divide-slate-100">
                {RECENT_ACTIVITY.map((a, i) => (
                  <div key={i} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-xs font-semibold text-slate-800">{a.action}</p>
                    <p className="text-xs text-slate-500">{a.component}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-400">{a.time}</span>
                      {a.docs && <span className="text-[10px] text-slate-400">{a.docs} docs</span>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}