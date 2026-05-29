import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, FileText, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import SharedNav from "@/components/SharedNav";
import { exportUsageAnalyticsPdf } from "@/utils/exportPdf";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const DAILY_USAGE = [
  { day: "May 1", calls: 78 }, { day: "May 5", calls: 112 }, { day: "May 10", calls: 95 },
  { day: "May 15", calls: 145 }, { day: "May 20", calls: 130 }, { day: "May 25", calls: 189 },
  { day: "May 29", calls: 201 },
];

const BY_COMPONENT = [
  { name: "Ironclad Protocol", calls: 1240, avgLatency: "0.91s" },
  { name: "The Site Board", calls: 876, avgLatency: "0.74s" },
  { name: "Estimator's Eye", calls: 334, avgLatency: "1.1s" },
];

const COMPONENT_CHART = [
  { name: "Ironclad", calls: 1240 },
  { name: "Site Board", calls: 876 },
  { name: "Estimator's Eye", calls: 334 },
];

const STATS = [
  { label: "Total API Calls", value: "2,450", icon: Zap },
  { label: "Documents Processed", value: "4,123", icon: FileText },
  { label: "Avg Response Time", value: "0.91s", icon: Clock },
];

export default function UsageAnalytics() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="user" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Usage Analytics</h1>
            <p className="text-sm text-slate-400">May 2026 · all installed components</p>
          </div>
          <Button variant="outline" className="text-sm h-9 gap-2"
            onClick={() => exportUsageAnalyticsPdf(STATS.map(s => ({ label: s.label, value: s.value })), BY_COMPONENT, DAILY_USAGE)}>
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

        {/* Call trend */}
        <Card>
          <CardContent className="pt-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Daily API Calls — May 2026</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={DAILY_USAGE}>
                <defs>
                  <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="calls" stroke="#7c3aed" fill="url(#callGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By component */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Calls by Component</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={COMPONENT_CHART} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="calls" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Component Breakdown</h3>
              <div className="space-y-4">
                {BY_COMPONENT.map(c => {
                  const pct = Math.round((c.calls / 2450) * 100);
                  return (
                    <div key={c.name}>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span className="font-semibold">{c.name}</span>
                        <span className="text-slate-400">{c.calls.toLocaleString()} calls · {c.avgLatency} avg</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full">
                        <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}