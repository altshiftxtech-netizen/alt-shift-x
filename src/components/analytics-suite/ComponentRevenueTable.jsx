import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

const TYPE_BADGE = {
  X1: "bg-blue-100 text-blue-700",
  X2: "bg-violet-100 text-violet-700",
  X4: "bg-amber-100 text-amber-700",
};

const STATUS_BADGE = {
  published: "bg-emerald-100 text-emerald-700",
  draft: "bg-slate-100 text-slate-500",
  pending_review: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
};

export default function ComponentRevenueTable({ components, installedData, governanceScores }) {
  const [sortField, setSortField] = useState("revenue");
  const [sortAsc, setSortAsc] = useState(false);

  const rows = components.map(comp => {
    const installs = installedData.filter(i => i.component_id === comp.id);
    const calls = installs.reduce((sum, i) => sum + (i.calls_this_month || 0), 0);
    const revenue = (comp.price || 0) * installs.length;
    const payout = revenue * 0.7;
    const govScore = governanceScores.find(g => g.component_id === comp.id);
    const certified = govScore?.certification_status === "certified";
    return { ...comp, installs: installs.length, calls, revenue, payout, certified, govScore };
  });

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortField] ?? 0;
    const bv = b[sortField] ?? 0;
    return sortAsc ? av - bv : bv - av;
  });

  const toggleSort = (field) => {
    if (sortField === field) setSortAsc(a => !a);
    else { setSortField(field); setSortAsc(false); }
  };

  const SortIcon = ({ field }) =>
    sortField === field
      ? sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3 text-slate-300" />;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Component Revenue Breakdown</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Click column headers to sort — identify your most lucrative training protocols</p>
        </div>
        <Link to="/builder/components" className="text-xs text-violet-600 hover:underline font-medium">Manage →</Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left py-3 px-6 text-slate-500 font-semibold">Component</th>
              <th className="text-center py-3 px-3 text-slate-500 font-semibold">Type</th>
              <th className="text-center py-3 px-3 text-slate-500 font-semibold">Status</th>
              <th
                className="text-right py-3 px-4 text-slate-500 font-semibold cursor-pointer hover:text-slate-800 select-none"
                onClick={() => toggleSort("installs")}
              >
                <span className="flex items-center justify-end gap-1">Installs <SortIcon field="installs" /></span>
              </th>
              <th
                className="text-right py-3 px-4 text-slate-500 font-semibold cursor-pointer hover:text-slate-800 select-none"
                onClick={() => toggleSort("calls")}
              >
                <span className="flex items-center justify-end gap-1">API Calls <SortIcon field="calls" /></span>
              </th>
              <th
                className="text-right py-3 px-4 text-slate-500 font-semibold cursor-pointer hover:text-slate-800 select-none"
                onClick={() => toggleSort("revenue")}
              >
                <span className="flex items-center justify-end gap-1">Gross Rev <SortIcon field="revenue" /></span>
              </th>
              <th
                className="text-right py-3 px-4 text-slate-500 font-semibold cursor-pointer hover:text-slate-800 select-none"
                onClick={() => toggleSort("payout")}
              >
                <span className="flex items-center justify-end gap-1">Your Payout <SortIcon field="payout" /></span>
              </th>
              <th className="text-center py-3 px-4 text-slate-500 font-semibold">Trust</th>
              <th className="text-center py-3 px-4 text-slate-500 font-semibold">Gov.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-10 text-slate-400">No components found — publish your first component to see analytics.</td>
              </tr>
            )}
            {sorted.map(comp => (
              <tr key={comp.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-6">
                  <div className="font-semibold text-slate-800">{comp.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{comp.code}</div>
                </td>
                <td className="text-center py-3.5 px-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_BADGE[comp.type] || "bg-slate-100 text-slate-500"}`}>
                    {comp.type}
                  </span>
                </td>
                <td className="text-center py-3.5 px-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[comp.status] || "bg-slate-100 text-slate-500"}`}>
                    {comp.status?.replace("_", " ")}
                  </span>
                </td>
                <td className="text-right py-3.5 px-4 font-semibold text-slate-800">{comp.installs}</td>
                <td className="text-right py-3.5 px-4 text-slate-600">{comp.calls.toLocaleString()}</td>
                <td className="text-right py-3.5 px-4 font-bold text-emerald-700">${comp.revenue.toFixed(0)}</td>
                <td className="text-right py-3.5 px-4 font-bold text-violet-700">${comp.payout.toFixed(0)}</td>
                <td className="text-center py-3.5 px-4">
                  <div className="flex items-center justify-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${comp.trust_score >= 80 ? "bg-emerald-500" : comp.trust_score >= 50 ? "bg-amber-400" : "bg-red-400"}`} />
                    <span className="text-slate-600">{comp.trust_score || 0}</span>
                  </div>
                </td>
                <td className="text-center py-3.5 px-4">
                  {comp.certified
                    ? <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto" />
                    : <span className="text-[10px] text-slate-300">—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}