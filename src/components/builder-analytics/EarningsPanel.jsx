import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, ArrowUpRight } from "lucide-react";

export default function EarningsPanel({ earnings }) {
  const { months = [], thisMonth = 0, payout = 0, growthPct = null, revShare = 70 } = earnings || {};
  const hasData = months.some((m) => m.revenue > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" /> Real-Time Earnings
          </CardTitle>
          {growthPct !== null && (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" />{growthPct >= 0 ? "+" : ""}{growthPct}% MoM
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-emerald-50 rounded-xl p-3">
            <p className="text-xs text-slate-500">This Month</p>
            <p className="text-2xl font-black text-emerald-700">${thisMonth.toLocaleString()}</p>
          </div>
          <div className="bg-violet-50 rounded-xl p-3">
            <p className="text-xs text-slate-500">Your Payout ({revShare}%)</p>
            <p className="text-2xl font-black text-violet-700">${payout.toLocaleString()}</p>
          </div>
        </div>
        {hasData ? (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={months} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="payouts" stroke="#7c3aed" fill="none" strokeWidth={2} strokeDasharray="4 2" name="Your Payout" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[160px] flex flex-col items-center justify-center text-center text-slate-400">
            <DollarSign className="w-7 h-7 mb-2 opacity-40" />
            <p className="text-xs">No earnings yet — revenue will appear here once your components start selling.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}