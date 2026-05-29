import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComponentsHeader({ filter, onFilter, total }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-2">
          <Link to="/builder" className="hover:text-slate-600">Builder Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 font-medium">My Components</span>
        </nav>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-100"><Package className="w-5 h-5 text-slate-600" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Components</h1>
            <p className="text-sm text-slate-500">{total} components in your portfolio</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 self-start sm:self-auto">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {["all", "published", "draft"].map(f => (
            <button key={f} onClick={() => onFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${filter === f ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-700"}`}>
              {f}
            </button>
          ))}
        </div>
        <Link to="/builder/publish">
          <Button className="bg-violet-700 hover:bg-violet-800 text-white text-xs h-8 gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Publish New
          </Button>
        </Link>
      </div>
    </div>
  );
}