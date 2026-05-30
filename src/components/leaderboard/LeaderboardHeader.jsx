import React from "react";
import { Trophy, ShieldCheck } from "lucide-react";

export default function LeaderboardHeader() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Builder Leaderboard</h1>
        </div>
        <p className="text-sm text-slate-500">
          Ranked by installs, revenue, and governance score — updated nightly by the Do-No-Harm scan engine.
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 shrink-0">
        <ShieldCheck className="w-3.5 h-3.5" />
        Do-No-Harm Oath Active
      </div>
    </div>
  );
}