import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, FileText, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import SharedNav from "@/components/SharedNav";
import { exportUsageAnalyticsPdf } from "@/utils/exportPdf";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ForecastPanel from "@/components/ForecastPanel";
import useUsageAnalytics from "@/hooks/useUsageAnalytics";

export default function UsageAnalytics() {
  const { loading, stats, byComponent, componentChart } = useUsageAnalytics();

  const monthLabel = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  const STATS = [
    { label: "Total API Calls", value: stats.totalCalls.toLocaleString(), icon: Zap },
    { label: "Documents Processed", value: stats.documentsProcessed.toLocaleString(), icon: FileText },
    { label: "Avg Response Time", value: stats.avgLatency, icon: Clock },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SharedNav mode="user" />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const hasUsage = byComponent.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="user" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Usage Analytics</h1>
            <p className="text-sm text-slate-400">{monthLabel} · all installed components</p>
          </div>
          <Button variant="outline" className="text-sm h-9 gap-2"
            onClick={() => exportUsageAnalyticsPdf(STATS.map(s => ({ label: s.label, value: s.value })), byComponent.map(c => ({ name: c.name, calls: c.calls, avgLatency: "—" })), [])}>
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="pt-5 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100"><Icon className="w-4 h-4 text-slate-600" /></div>
                <div>
                  <p className="text-xl font-black text-slate-900">{value}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Forecast */}
        <ForecastPanel />

        {/* By component */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Calls by Component</h3>
              {hasUsage ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={componentChart} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="calls" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center text-center text-slate-400">
                  <Zap className="w-7 h-7 mb-2 opacity-40" />
                  <p className="text-xs">No API usage yet this month.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Component Breakdown</h3>
              {hasUsage ? (
                <div className="space-y-4">
                  {byComponent.map(c => {
                    const pct = stats.totalCalls > 0 ? Math.round((c.calls / stats.totalCalls) * 100) : 0;
                    return (
                      <div key={c.name}>
                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                          <span className="font-semibold">{c.name}</span>
                          <span className="text-slate-400">{c.calls.toLocaleString()} calls</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full">
                          <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center text-center text-slate-400">
                  <FileText className="w-7 h-7 mb-2 opacity-40" />
                  <p className="text-xs">Install and use components to see your breakdown.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}