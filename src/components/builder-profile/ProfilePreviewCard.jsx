import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Globe, Download, ShieldCheck, Package } from "lucide-react";

const tierConfig = {
  community: { label: "○ COMMUNITY", className: "bg-slate-100 text-slate-600 border border-slate-300" },
  certified: { label: "◇ CERTIFIED", className: "bg-violet-50 text-violet-700 border border-violet-200" },
  official: { label: "◆ OFFICIAL", className: "bg-amber-50 text-amber-700 border border-amber-300" },
};

export default function ProfilePreviewCard({ profile: p }) {
  const tier = tierConfig[p.tier] || tierConfig.community;
  const initials = p.name.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <div className="sticky top-6">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Marketplace Preview</p>
      <Card className="border border-slate-200 shadow-md overflow-hidden">
        {/* Header band */}
        <div className="h-16 bg-gradient-to-br from-slate-800 to-slate-700" />
        <CardContent className="pt-0 pb-5">
          {/* Avatar */}
          <div className="-mt-8 mb-3 flex items-end justify-between">
            <div className="w-16 h-16 rounded-2xl bg-violet-700 flex items-center justify-center text-white text-xl font-black border-4 border-white shadow-lg">
              {initials}
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${tier.className}`}>{tier.label}</span>
          </div>

          <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{p.tagline}</p>

          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
            {p.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</span>}
            {p.website && <a href={p.website} className="flex items-center gap-1 hover:text-violet-600"><Globe className="w-3 h-3" />Website</a>}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mt-3 line-clamp-3">{p.bio}</p>

          <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-1"><Download className="w-3 h-3 text-slate-400" /><p className="text-sm font-black text-slate-900">{p.totalInstalls.toLocaleString()}</p></div>
              <p className="text-[10px] text-slate-400">Installs</p>
            </div>
            <div className="text-center flex-1 border-x border-slate-100">
              <div className="flex items-center justify-center gap-1"><ShieldCheck className="w-3 h-3 text-slate-400" /><p className="text-sm font-black text-slate-900">{p.avgTrustScore}</p></div>
              <p className="text-[10px] text-slate-400">Avg Trust</p>
            </div>
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-1"><Package className="w-3 h-3 text-slate-400" /><p className="text-sm font-black text-slate-900">{p.components}</p></div>
              <p className="text-[10px] text-slate-400">Components</p>
            </div>
          </div>

          {p.specializations.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.specializations.map(s => (
                <span key={s} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          )}

          <p className="text-[10px] text-slate-400 mt-3">Member since {p.memberSince}</p>
        </CardContent>
      </Card>
    </div>
  );
}