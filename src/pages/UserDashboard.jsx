import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, BarChart2, Key, Settings, ShieldCheck, ArrowRight, Webhook } from "lucide-react";
import SharedNav from "@/components/SharedNav";

const STATS = [
  { label: "Installed Components", value: "3", icon: Package, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "API Calls This Month", value: "2,450", icon: BarChart2, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Active API Keys", value: "2", icon: Key, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Trust Score Avg", value: "90.3", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
];

const QUICK_LINKS = [
  { to: "/dashboard/installed", label: "Installed Components", desc: "Manage your active components", icon: Package },
  { to: "/dashboard/usage", label: "Usage Analytics", desc: "View API call trends & forecasts", icon: BarChart2 },
  { to: "/dashboard/api-keys", label: "API Keys", desc: "Create and manage API keys", icon: Key },
  { to: "/dashboard/webhooks", label: "Webhooks", desc: "Configure event subscriptions", icon: Webhook },
  { to: "/dashboard/subscription", label: "Subscription", desc: "Manage your plan & billing", icon: ShieldCheck },
  { to: "/dashboard/settings", label: "Account Settings", desc: "Update profile and preferences", icon: Settings },
];

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="user" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Welcome back — here's your platform overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardContent className="pt-5 pb-4">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4.5 h-4.5 ${color}`} />
                </div>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Access</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {QUICK_LINKS.map(({ to, label, desc, icon: Icon }) => (
              <Link key={to} to={to}>
                <Card className="hover:border-violet-200 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardContent className="pt-4 pb-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{label}</p>
                      <p className="text-xs text-slate-400 truncate">{desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-violet-900">Explore the Marketplace</p>
            <p className="text-sm text-violet-700 mt-0.5">Discover new AI components to supercharge your workflow</p>
          </div>
          <Link to="/marketplace">
            <Button className="bg-violet-700 hover:bg-violet-800 text-white shrink-0">Browse Components →</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}