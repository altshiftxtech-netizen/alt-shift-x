import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Upload } from "lucide-react";

export default function PublishHeader() {
  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-2">
        <Link to="/builder/components" className="hover:text-slate-600">My Components</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium">Publish Component</span>
      </nav>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-violet-100"><Upload className="w-5 h-5 text-violet-700" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Publish a Component</h1>
          <p className="text-sm text-slate-500">Complete all four steps to submit your component for platform review.</p>
        </div>
      </div>
    </div>
  );
}