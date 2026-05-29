import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, BarChart3 } from "lucide-react";

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
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm self-start sm:self-auto flex-wrap">
        {components.map(c => (
          <button key={c.id} onClick={() => onSelect(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selected === c.id ? "bg-amber-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}