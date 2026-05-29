import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck } from "lucide-react";

export default function TrustEngineHeader({ components, selectedComponent, onSelectComponent }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-2">
          <Link to="/builder" className="hover:text-slate-600 transition-colors">Builder Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 font-medium">Trust Engine</span>
        </nav>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-100">
            <ShieldCheck className="w-5 h-5 text-violet-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Trust Engine</h1>
            <p className="text-sm text-slate-500">Real-time quality scoring across all your published components.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm self-start sm:self-auto">
        {components.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectComponent(c.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedComponent === c.id
                ? "bg-violet-700 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {c.displayName}
          </button>
        ))}
      </div>
    </div>
  );
}