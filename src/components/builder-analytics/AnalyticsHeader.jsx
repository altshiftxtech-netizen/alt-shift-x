import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, BarChart3 } from "lucide-react";
import ComponentSelectDropdown from "@/components/builder-analytics/ComponentSelectDropdown";

export default function AnalyticsHeader({ components, selected, onSelect }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-2">
          <Link to="/builder" className="hover:text-slate-600">Builder Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 font-medium">Analytics</span>
        </nav>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100"><BarChart3 className="w-5 h-5 text-amber-600" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Install & Usage Analytics</h1>
            <p className="text-sm text-slate-500">Trends, geography, and churn across your component portfolio.</p>
          </div>
        </div>
      </div>
      <ComponentSelectDropdown components={components} selected={selected} onSelect={onSelect} />
    </div>
  );
}