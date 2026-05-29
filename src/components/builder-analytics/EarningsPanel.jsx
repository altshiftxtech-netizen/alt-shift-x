import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, ArrowUpRight } from "lucide-react";

const earningsData = [
  { month: "Jan", revenue: 3200, payouts: 2240 },
  { month: "Feb", revenue: 4100, payouts: 2870 },
  { month: "Mar", revenue: 5800, payouts: 4060 },
  { month: "Apr", revenue: 5200, payouts: 3640 },
  { month: "May", revenue: 6918, payouts: 4843 },
];

export default function EarningsPanel() {
  const thisMonth = earningsData[earningsData.length - 1];
  const lastMonth = earningsData[earningsData.length - 2];
  const growthPct = (((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100).toFixed(1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" /> Real-Time Earnings
          </CardTitle>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3 h-3" />+{growthPct}% MoM
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-emerald-50 rounded-xl p-3">
            <p className="text-xs text-slate-500">This Month</p>
            <p className="text-2xl font-black text-emerald-700">${thisMonth.revenue.toLocaleString()}</p>
          </div>
          <div className="bg-violet-50 rounded-xl p-3">
            <p className="text-xs text-slate-500">Your Payout (70%)</p>
            <p className="text-2xl font-black text-violet-700">${thisMonth.payouts.toLocaleString()}</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={earningsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
      </CardContent>
    </Card>
  );
}