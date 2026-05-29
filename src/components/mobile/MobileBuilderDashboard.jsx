import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, Star, Package, TrendingUp, Clock, CheckCircle2, AlertTriangle, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const typeColors = {
  X1: "bg-violet-100 text-violet-700",
  X2: "bg-blue-100 text-blue-700",
  X4: "bg-amber-100 text-amber-700",
};

const statusConfig = {
  published: { label: "Live", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  pending_review: { label: "In Review", color: "bg-amber-100 text-amber-700", icon: Clock },
  draft: { label: "Draft", color: "bg-slate-100 text-slate-500", icon: Package },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-600", icon: AlertTriangle },
};

export default function MobileBuilderDashboard({ user }) {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Component.filter({ builder_id: user?.id }, "-created_date", 10)
      .catch(() => [])
      .then(data => { setComponents(data || []); setLoading(false); });
  }, [user?.id]);

  const totalInstalls = components.reduce((sum, c) => sum + (c.installs_count || 0), 0);
  const avgTrust = components.length
    ? Math.round(components.reduce((sum, c) => sum + (c.trust_score || 0), 0) / components.length)
    : 0;
  const publishedCount = components.filter(c => c.status === "published").length;

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-slate-900">Builder Portal</h1>
        <p className="text-sm text-slate-400">Your components at a glance</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center">
              <p className="text-xl font-black text-slate-900">{publishedCount}</p>
              <p className="text-[10px] text-slate-400">Live</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center">
              <p className="text-xl font-black text-slate-900">{totalInstalls.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400">Installs</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-3 text-center">
              <p className="text-xl font-black text-slate-900">{avgTrust || "—"}</p>
              <p className="text-[10px] text-slate-400">Avg Trust</p>
            </div>
          </div>

          {/* My Components */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900">My Components</h2>
              <Link to="/builder/components" className="text-xs text-violet-600 flex items-center gap-0.5">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {components.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                <Package className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No components yet</p>
                <Link to="/builder/publish" className="text-xs text-violet-600 font-semibold mt-1 block">
                  Publish your first →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {components.map(c => {
                  const sc = statusConfig[c.status] || statusConfig.draft;
                  const StatusIcon = sc.icon;
                  return (
                    <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeColors[c.type] || "bg-slate-100 text-slate-600"}`}>
                            {c.type}
                          </span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${sc.color}`}>
                            <StatusIcon className="w-2.5 h-2.5" />{sc.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-emerald-600">
                          <ShieldCheck className="w-3 h-3" />
                          <span className="font-bold">{c.trust_score || 0}</span>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{c.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{c.code}</p>
                      <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
                        <span><strong className="text-slate-600">{(c.installs_count || 0).toLocaleString()}</strong> installs</span>
                        <span><strong className="text-slate-600">{(c.reviews_count || 0)}</strong> reviews</span>
                        {c.rating > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-400" />
                            <strong className="text-slate-600">{(c.rating || 0).toFixed(1)}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-2">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/builder/publish">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-2">
                  <div className="p-2 bg-violet-50 rounded-xl"><Package className="w-4 h-4 text-violet-600" /></div>
                  <span className="text-xs font-semibold text-slate-800">Publish</span>
                </div>
              </Link>
              <Link to="/builder/analytics">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-xl"><TrendingUp className="w-4 h-4 text-blue-600" /></div>
                  <span className="text-xs font-semibold text-slate-800">Analytics</span>
                </div>
              </Link>
              <Link to="/builder/reviews">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-2">
                  <div className="p-2 bg-amber-50 rounded-xl"><Star className="w-4 h-4 text-amber-500" /></div>
                  <span className="text-xs font-semibold text-slate-800">Reviews</span>
                </div>
              </Link>
              <Link to="/builder/trust">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 rounded-xl"><ShieldCheck className="w-4 h-4 text-emerald-600" /></div>
                  <span className="text-xs font-semibold text-slate-800">Trust Score</span>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}