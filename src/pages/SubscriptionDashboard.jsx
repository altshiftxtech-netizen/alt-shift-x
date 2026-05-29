import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SharedNav from "@/components/SharedNav";
import {
  Zap, Shield, Building2, CheckCircle2, CreditCard,
  ArrowRight, Calendar, Download, AlertTriangle, RefreshCw
} from "lucide-react";

// ── Mock data (replace with real API calls when backend is ready) ─────────────
const CURRENT_PLAN = {
  key: "pro",
  name: "Pro",
  price: 99,
  limit: 10000,
  used: 6843,
  renewsOn: "June 1, 2026",
  status: "active", // "active" | "cancelled" | "past_due"
};

const INVOICES = [
  { date: "May 1, 2026", amount: "$99.00", status: "Paid", id: "INV-2026-005" },
  { date: "Apr 1, 2026", amount: "$99.00", status: "Paid", id: "INV-2026-004" },
  { date: "Mar 1, 2026", amount: "$99.00", status: "Paid", id: "INV-2026-003" },
  { date: "Feb 1, 2026", amount: "$99.00", status: "Paid", id: "INV-2026-002" },
  { date: "Jan 1, 2026", amount: "$29.00", status: "Paid", id: "INV-2026-001" },
];

const PLANS = [
  {
    key: "starter", name: "Starter", price: 29, icon: Zap,
    limit: "1,000 calls/mo", color: "text-slate-600", bg: "bg-slate-100",
  },
  {
    key: "pro", name: "Pro", price: 99, icon: Shield,
    limit: "10,000 calls/mo", color: "text-violet-700", bg: "bg-violet-100",
  },
  {
    key: "enterprise", name: "Enterprise", price: 299, icon: Building2,
    limit: "Unlimited calls", color: "text-blue-700", bg: "bg-blue-100",
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function PlanBadge({ status }) {
  const styles = {
    active: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-600",
    past_due: "bg-amber-100 text-amber-700",
  };
  const labels = { active: "Active", cancelled: "Cancelled", past_due: "Past Due" };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function QuotaSection({ used, limit }) {
  const pct = Math.min((used / limit) * 100, 100);
  const remaining = limit - used;

  const barColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-violet-600";
  const textColor = pct >= 90 ? "text-red-600" : pct >= 70 ? "text-amber-600" : "text-violet-700";

  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-slate-900">API Quota</p>
          <span className={`text-xs font-semibold ${textColor}`}>{Math.round(pct)}% used</span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className={`text-lg font-black ${textColor}`}>{used.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Calls used</p>
          </div>
          <div>
            <p className="text-lg font-black text-slate-800">{remaining.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Remaining</p>
          </div>
          <div>
            <p className="text-lg font-black text-slate-800">{limit.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Monthly limit</p>
          </div>
        </div>

        {pct >= 90 && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-700">Quota almost exhausted</p>
              <p className="text-[10px] text-red-500">Upgrade to avoid API call interruptions.</p>
            </div>
            <Link to="/pricing" className="ml-auto shrink-0">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs h-7">Upgrade</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CurrentPlanCard({ plan }) {
  const planMeta = PLANS.find(p => p.key === plan.key);
  const Icon = planMeta?.icon || Zap;

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-bold text-slate-900">Current Plan</p>
          <PlanBadge status={plan.status} />
        </div>

        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
          <div className={`p-2.5 rounded-xl ${planMeta?.bg}`}>
            <Icon className={`w-5 h-5 ${planMeta?.color}`} />
          </div>
          <div className="flex-1">
            <p className="text-base font-black text-slate-900">{plan.name}</p>
            <p className="text-xs text-slate-500">{planMeta?.limit}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-slate-900">${plan.price}</p>
            <p className="text-[10px] text-slate-400">/month</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Calendar className="w-3.5 h-3.5" />
          <span>Renews on <span className="font-semibold text-slate-700">{plan.renewsOn}</span></span>
        </div>

        <div className="flex gap-2">
          <Link to="/pricing" className="flex-1">
            <Button className="w-full bg-violet-700 hover:bg-violet-800 text-white text-xs h-8 gap-1.5">
              <ArrowRight className="w-3.5 h-3.5" /> Upgrade Plan
            </Button>
          </Link>
          <Button variant="outline" className="text-xs h-8 text-slate-500">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentMethodCard() {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-slate-900">Payment Method</p>
          <Button variant="ghost" size="sm" className="text-xs text-violet-700 h-7 gap-1">
            <RefreshCw className="w-3 h-3" /> Update
          </Button>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-[8px] text-white font-bold tracking-tight">VISA</div>
          <div>
            <p className="text-sm font-semibold text-slate-800">•••• •••• •••• 4242</p>
            <p className="text-[10px] text-slate-400">Expires 12/27</p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
        </div>
      </CardContent>
    </Card>
  );
}

function InvoicesCard() {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-sm font-bold text-slate-900 mb-4">Invoice History</p>
        <div className="divide-y divide-slate-100">
          {INVOICES.map((inv) => (
            <div key={inv.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="p-1.5 bg-slate-100 rounded-lg">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800">{inv.date}</p>
                <p className="text-[10px] text-slate-400">{inv.id}</p>
              </div>
              <span className="text-sm font-bold text-slate-800">{inv.amount}</span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{inv.status}</span>
              <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors" title="Download">
                <Download className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SubscriptionDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="user" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscription</h1>
          <p className="text-sm text-slate-400">Manage your plan, quota, and billing details.</p>
        </div>

        {/* Top grid: plan + quota */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CurrentPlanCard plan={CURRENT_PLAN} />
          <QuotaSection used={CURRENT_PLAN.used} limit={CURRENT_PLAN.limit} />
        </div>

        {/* Plan comparison strip */}
        <Card className="border-violet-100 bg-gradient-to-r from-violet-50 to-slate-50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-900">Available Plans</p>
              <Link to="/pricing" className="text-xs text-violet-700 hover:underline font-semibold flex items-center gap-0.5">
                View full details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {PLANS.map(({ key, name, price, icon: Icon, limit, color, bg }) => (
                <div key={key} className={`relative rounded-xl border p-3 text-center transition-all ${
                  CURRENT_PLAN.key === key
                    ? "border-violet-400 bg-white shadow-sm"
                    : "border-slate-200 bg-white/60 opacity-70"
                }`}>
                  {CURRENT_PLAN.key === key && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Current</div>
                  )}
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mx-auto mb-2`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <p className="text-xs font-bold text-slate-900">{name}</p>
                  <p className="text-[10px] text-slate-400 mb-1">{limit}</p>
                  <p className="text-sm font-black text-slate-900">${price}<span className="text-[10px] font-normal text-slate-400">/mo</span></p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment method + invoices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <PaymentMethodCard />
          <InvoicesCard />
        </div>
      </div>
    </div>
  );
}