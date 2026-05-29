import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Package, ShieldCheck, Star, CheckCircle2, Clock, AlertTriangle, XCircle, Loader2, ChevronRight, Globe, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

const typeColors = {
  X1: "bg-violet-100 text-violet-700",
  X2: "bg-blue-100 text-blue-700",
  X4: "bg-amber-100 text-amber-700",
};

const statusConfig = {
  published: { label: "Live", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  pending_review: { label: "In Review", color: "bg-amber-100 text-amber-700", icon: Clock },
  draft: { label: "Draft", color: "bg-slate-100 text-slate-500", icon: EyeOff },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-600", icon: XCircle },
};

const FILTER_TABS = ["All", "Live", "In Review", "Draft"];

export default function MobileComponents() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        return base44.entities.Component.filter({ builder_id: u?.id }, "-updated_date", 20);
      })
      .then(data => { setComponents(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statusFilterMap = {
    "All": null,
    "Live": "published",
    "In Review": "pending_review",
    "Draft": "draft",
  };

  const filtered = filter === "All"
    ? components
    : components.filter(c => c.status === statusFilterMap[filter]);

  const counts = {
    "All": components.length,
    "Live": components.filter(c => c.status === "published").length,
    "In Review": components.filter(c => c.status === "pending_review").length,
    "Draft": components.filter(c => c.status === "draft").length,
  };

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Components</h1>
          <p className="text-sm text-slate-400">{components.length} total component{components.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          to="/builder/publish"
          className="flex items-center gap-1.5 bg-violet-700 text-white text-xs font-semibold px-3 py-2 rounded-xl"
        >
          <Package className="w-3.5 h-3.5" /> Publish
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 text-[11px] font-semibold py-1.5 rounded-lg transition-all ${
              filter === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            {tab}
            {counts[tab] > 0 && (
              <span className={`ml-1 text-[9px] px-1 rounded-full ${filter === tab ? "bg-slate-100" : "bg-transparent"}`}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-500">No {filter !== "All" ? filter.toLowerCase() : ""} components</p>
          {filter === "All" && (
            <Link to="/builder/publish" className="text-xs text-violet-600 font-semibold mt-1 block">
              Publish your first component →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const sc = statusConfig[c.status] || statusConfig.draft;
            const StatusIcon = sc.icon;
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {/* Header row */}
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeColors[c.type] || "bg-slate-100 text-slate-600"}`}>
                        {c.type}
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${sc.color}`}>
                        <StatusIcon className="w-2.5 h-2.5" />{sc.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />{c.trust_score || 0}
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                  <p className="text-[10px] font-mono text-slate-400">{c.code}</p>
                  {c.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                  )}
                </div>

                {/* Stats row */}
                <div className="border-t border-slate-100 px-4 py-2.5 flex items-center gap-5">
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-800">{(c.installs_count || 0).toLocaleString()}</p>
                    <p className="text-[9px] text-slate-400">installs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-800">{c.reviews_count || 0}</p>
                    <p className="text-[9px] text-slate-400">reviews</p>
                  </div>
                  {(c.rating || 0) > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                      <p className="text-xs font-bold text-slate-800">{(c.rating || 0).toFixed(1)}</p>
                    </div>
                  )}
                  <div className="ml-auto">
                    <Link
                      to={`/marketplace/${c.id}`}
                      className="text-[10px] text-violet-600 font-semibold flex items-center gap-0.5"
                    >
                      View <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}