import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, User, CheckCircle2 } from "lucide-react";

export default function ProfileHeader({ saved }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-2">
          <Link to="/builder" className="hover:text-slate-600">Builder Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 font-medium">Builder Profile</span>
        </nav>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-100"><User className="w-5 h-5 text-slate-600" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Builder Profile</h1>
            <p className="text-sm text-slate-500">Edit your public profile and preview how it appears in the marketplace.</p>
          </div>
        </div>
      </div>
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-2 rounded-lg">
          <CheckCircle2 className="w-3.5 h-3.5" /> Profile saved
        </div>
      )}
    </div>
  );
}