import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Star, MessageSquare } from "lucide-react";

export default function ReviewsHeader({ total, pending }) {
  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-2">
        <Link to="/builder" className="hover:text-slate-600">Builder Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium">Reviews Manager</span>
      </nav>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-yellow-100"><Star className="w-5 h-5 text-yellow-600" /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reviews Manager</h1>
            <p className="text-sm text-slate-500">{total} total reviews · {pending} awaiting your response</p>
          </div>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-2 rounded-lg">
            <MessageSquare className="w-3.5 h-3.5" />
            {pending} review{pending > 1 ? "s" : ""} need a response
          </div>
        )}
      </div>
    </div>
  );
}