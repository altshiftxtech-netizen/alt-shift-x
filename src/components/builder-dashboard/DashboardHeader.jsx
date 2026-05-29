import React from "react";

const tierConfig = {
  community: { label: "○ COMMUNITY", className: "bg-slate-100 text-slate-600 border border-slate-300" },
  certified: { label: "◇ CERTIFIED", className: "bg-violet-50 text-violet-700 border border-violet-200" },
  official: { label: "◆ OFFICIAL", className: "bg-amber-50 text-amber-700 border border-amber-300" },
};

export default function DashboardHeader({ builderName, tier = "certified" }) {
  const t = tierConfig[tier];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <p className="text-sm text-slate-400 mb-1">Builder Dashboard</p>
        <h1 className="text-2xl font-bold text-slate-900">{greeting}, {builderName.split(" ")[0]} 👋</h1>
        <p className="text-sm text-slate-500 mt-0.5">Here's how your components are performing today.</p>
      </div>
      <span className={`text-xs font-bold px-3 py-1.5 rounded-full self-start sm:self-auto ${t.className}`}>{t.label}</span>
    </div>
  );
}