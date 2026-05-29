import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FlaskConical } from "lucide-react";

export default function SandboxHeader() {
  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-2">
        <Link to="/builder" className="hover:text-slate-600 transition-colors">Builder Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium">Testing Sandbox</span>
      </nav>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-violet-100">
          <FlaskConical className="w-5 h-5 text-violet-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Testing Sandbox</h1>
          <p className="text-sm text-slate-500">
            Run your component against real documents and inspect extraction accuracy, latency, and hallucination risk before publishing.
          </p>
        </div>
      </div>
    </div>
  );
}