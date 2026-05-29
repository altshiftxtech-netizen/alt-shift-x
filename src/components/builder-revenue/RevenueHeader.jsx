import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const tierConfig = {
  community: { label: "○ COMMUNITY", className: "bg-slate-100 text-slate-600 border border-slate-300" },
  certified: { label: "◇ CERTIFIED", className: "bg-violet-50 text-violet-700 border border-violet-200" },
  official: { label: "◆ OFFICIAL", className: "bg-amber-50 text-amber-700 border border-amber-300" },
};

export default function RevenueHeader({ builderTier = "certified" }) {
  const tier = tierConfig[builderTier] || tierConfig.community;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-2">
          <Link to="/builder" className="hover:text-slate-600 transition-colors">Builder Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 font-medium">Revenue & Payouts</span>
        </nav>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Revenue & Payouts</h1>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full tracking-wide ${tier.className}`}>
            {tier.label}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Track your earnings, manage payouts, and analyze component performance.
        </p>
      </div>

      <Button variant="outline" className="flex items-center gap-2 text-slate-600 border-slate-200 hover:bg-slate-100 self-start sm:self-auto">
        <Download className="w-4 h-4" />
        Download Tax Summary
      </Button>
    </div>
  );
}