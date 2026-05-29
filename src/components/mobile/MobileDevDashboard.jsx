import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, Zap, Package, ArrowRight, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const typeColors = {
  X1: "bg-violet-100 text-violet-700",
  X2: "bg-blue-100 text-blue-700",
  X4: "bg-amber-100 text-amber-700",
};

export default function MobileDevDashboard({ user }) {
  const [subscription, setSubscription] = useState(null);
  const [installed, setInstalled] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.functions.invoke("getSubscription", {}).catch(() => ({ data: null })),
      base44.entities.InstalledComponent.filter({ status: "active" }, "-installed_at", 5).catch(() => []),
    ]).then(([subRes, instData]) => {
      setSubscription(subRes?.data?.subscription || null);
      setInstalled(instData || []);
      setLoading(false);
    });
  }, []);

  const planLimits = { starter: 1000, pro: 10000, enterprise: 100000 };
  const planLabel = { starter: "Starter", pro: "Pro", enterprise: "Enterprise" };
  const plan = subscription?.plan || "starter";
  const used = subscription?.api_calls_used || 0;
  const limit = planLimits[plan] || 1000;
  const pct = Math.min((used / limit) * 100, 100);
  const quotaColor = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="p-4 space-y-4">
      {/* Welcome */}
      <div className="pt-2">
        <h1 className="text-xl font-bold text-slate-900">
          Hey{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="text-sm text-slate-400">Developer Dashboard</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : (
        <>
          {/* API Quota Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-bold text-slate-900">API Quota</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                plan === "pro" ? "bg-violet-100 text-violet-700" :
                plan === "enterprise" ? "bg-blue-100 text-blue-700" :
                "bg-slate-100 text-slate-600"
              }`}>{planLabel[plan]}</span>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">{used.toLocaleString()} used</span>
                <span className="text-slate-500">{limit.toLocaleString()} limit</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${quotaColor}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
            {pct > 80 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{pct > 90 ? "Critical: " : "Warning: "}You're at {pct.toFixed(0)}% of your quota</span>
              </div>
            )}
            {!subscription && (
              <Link to="/pricing" className="block text-center text-xs text-violet-700 font-semibold bg-violet-50 rounded-xl py-2">
                Upgrade Plan →
              </Link>
            )}
          </div>

          {/* Installed Components */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900">Installed Components</h2>
              <Link to="/dashboard/installed" className="text-xs text-violet-600 flex items-center gap-0.5">
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {installed.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                <Package className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No components installed yet</p>
                <Link to="/marketplace" className="text-xs text-violet-600 font-semibold mt-1 block">Browse Marketplace →</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {installed.map(c => (
                  <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeColors[c.component_type] || "bg-slate-100 text-slate-600"}`}>
                        {c.component_type || "—"}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{c.component_name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{c.component_code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-700">{(c.calls_this_month || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">calls/mo</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-2">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/dashboard/api-keys">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-2 active:bg-slate-50">
                  <div className="p-2 bg-violet-50 rounded-xl"><Zap className="w-4 h-4 text-violet-600" /></div>
                  <span className="text-xs font-semibold text-slate-800">API Keys</span>
                </div>
              </Link>
              <Link to="/marketplace">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-2 active:bg-slate-50">
                  <div className="p-2 bg-blue-50 rounded-xl"><Package className="w-4 h-4 text-blue-600" /></div>
                  <span className="text-xs font-semibold text-slate-800">Marketplace</span>
                </div>
              </Link>
              <Link to="/dashboard/subscription">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-2 active:bg-slate-50">
                  <div className="p-2 bg-emerald-50 rounded-xl"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
                  <span className="text-xs font-semibold text-slate-800">Subscription</span>
                </div>
              </Link>
              <Link to="/dashboard/settings">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-2 active:bg-slate-50">
                  <div className="p-2 bg-slate-100 rounded-xl"><Clock className="w-4 h-4 text-slate-600" /></div>
                  <span className="text-xs font-semibold text-slate-800">Settings</span>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}