import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import SharedNav from "@/components/SharedNav";
import {
  Zap, Shield, Building2, CheckCircle2, CreditCard,
  ArrowRight, Calendar, Download, AlertTriangle, RefreshCw, Loader2
} from "lucide-react";

const PLAN_META = {
  starter: { name: "Starter", price: 29, limit: 1000, icon: Zap, color: "text-slate-600", bg: "bg-slate-100" },
  pro: { name: "Pro", price: 99, limit: 10000, icon: Shield, color: "text-violet-700", bg: "bg-violet-100" },
  enterprise: { name: "Enterprise", price: 299, limit: null, icon: Building2, color: "text-blue-700", bg: "bg-blue-100" },
};

const ALL_PLANS = ["starter", "pro", "enterprise"];

function PlanBadge({ status }) {
  const styles = { active: "bg-emerald-100 text-emerald-700", cancelled: "bg-red-100 text-red-600", past_due: "bg-amber-100 text-amber-700", trialing: "bg-blue-100 text-blue-700" };
  const labels = { active: "Active", cancelled: "Cancelled", past_due: "Past Due", trialing: "Trial" };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles[status] || styles.active}`}>{labels[status] || status}</span>;
}

function QuotaSection({ used, limit }) {
  const pct = limit ? Math.min((used / limit) * 100, 100) : 0;
  const remaining = limit ? limit - used : "∞";
  const barColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-violet-600";
  const textColor = pct >= 90 ? "text-red-600" : pct >= 70 ? "text-amber-600" : "text-violet-700";

  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-slate-900">API Quota</p>
          <span className={`text-xs font-semibold ${textColor}`}>{limit ? `${Math.round(pct)}% used` : "Unlimited"}</span>
        </div>
        {limit ? (
          <>
            <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden">
              <div className={`h-3 rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className={`text-lg font-black ${textColor}`}>{used.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400">Used</p>
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
                <p className="text-xs text-red-700 flex-1"><span className="font-bold">Quota almost exhausted.</span> Upgrade to avoid interruptions.</p>
                <Link to="/pricing"><Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs h-7 shrink-0">Upgrade</Button></Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-3xl font-black text-blue-700">∞</p>
            <p className="text-xs text-slate-400 mt-1">Unlimited API calls on your Enterprise plan</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NoSubscription() {
  return (
    <Card className="border-violet-200">
      <CardContent className="py-12 text-center">
        <div className="p-3 bg-violet-100 rounded-2xl w-fit mx-auto mb-4"><Zap className="w-6 h-6 text-violet-600" /></div>
        <p className="text-base font-bold text-slate-900 mb-1">No active subscription</p>
        <p className="text-sm text-slate-500 mb-5">Choose a plan to start using the Alt+Shift+X API</p>
        <Link to="/pricing"><Button className="bg-violet-700 hover:bg-violet-800 text-white gap-2"><ArrowRight className="w-4 h-4" /> View Plans</Button></Link>
      </CardContent>
    </Card>
  );
}

export default function SubscriptionDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const justSubscribed = new URLSearchParams(location.search).get("subscribed") === "true";

  useEffect(() => {
    base44.functions.invoke("getSubscription", {}).then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const sub = data?.subscription;
  const invoices = data?.invoices || [];
  const planMeta = sub ? PLAN_META[sub.plan] : null;
  const PlanIcon = planMeta?.icon || Zap;

  return (
    <div className="min-h-screen bg-slate-50">
      <SharedNav mode="user" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Subscription</h1>
            <p className="text-sm text-slate-400">Manage your plan, quota, and billing details.</p>
          </div>
          {justSubscribed && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4" /> Subscription activated!
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : !sub ? (
          <NoSubscription />
        ) : (
          <>
            {/* Plan + Quota */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Current Plan */}
              <Card>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-sm font-bold text-slate-900">Current Plan</p>
                    <PlanBadge status={sub.status} />
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                    <div className={`p-2.5 rounded-xl ${planMeta.bg}`}><PlanIcon className={`w-5 h-5 ${planMeta.color}`} /></div>
                    <div className="flex-1">
                      <p className="text-base font-black text-slate-900">{planMeta.name}</p>
                      <p className="text-xs text-slate-500">{planMeta.limit ? `${planMeta.limit.toLocaleString()} calls/mo` : "Unlimited calls"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-900">${planMeta.price}</p>
                      <p className="text-[10px] text-slate-400">/month</p>
                    </div>
                  </div>
                  {sub.current_period_end && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{sub.cancel_at_period_end ? "Cancels" : "Renews"} on <span className="font-semibold text-slate-700">{sub.current_period_end}</span></span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link to="/pricing" className="flex-1">
                      <Button className="w-full bg-violet-700 hover:bg-violet-800 text-white text-xs h-8 gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5" /> Upgrade Plan
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <QuotaSection used={sub.api_calls_used || 0} limit={planMeta.limit} />
            </div>

            {/* Plan comparison strip */}
            <Card className="border-violet-100 bg-gradient-to-r from-violet-50 to-slate-50">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-slate-900">Available Plans</p>
                  <Link to="/pricing" className="text-xs text-violet-700 hover:underline font-semibold flex items-center gap-0.5">View full details <ArrowRight className="w-3 h-3" /></Link>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {ALL_PLANS.map(key => {
                    const m = PLAN_META[key];
                    const Icon = m.icon;
                    return (
                      <div key={key} className={`relative rounded-xl border p-3 text-center transition-all ${sub.plan === key ? "border-violet-400 bg-white shadow-sm" : "border-slate-200 bg-white/60 opacity-70"}`}>
                        {sub.plan === key && <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Current</div>}
                        <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center mx-auto mb-2`}><Icon className={`w-4 h-4 ${m.color}`} /></div>
                        <p className="text-xs font-bold text-slate-900">{m.name}</p>
                        <p className="text-[10px] text-slate-400 mb-1">{m.limit ? `${m.limit.toLocaleString()} calls` : "Unlimited"}</p>
                        <p className="text-sm font-black text-slate-900">${m.price}<span className="text-[10px] font-normal text-slate-400">/mo</span></p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Payment + Invoices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card>
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-slate-900">Payment Method</p>
                    <Button variant="ghost" size="sm" className="text-xs text-violet-700 h-7 gap-1"><RefreshCw className="w-3 h-3" /> Update</Button>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-[8px] text-white font-bold">VISA</div>
                    <div><p className="text-sm font-semibold text-slate-800">•••• •••• •••• 4242</p><p className="text-[10px] text-slate-400">Expires 12/27</p></div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-5">
                  <p className="text-sm font-bold text-slate-900 mb-4">Invoice History</p>
                  {invoices.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No invoices yet</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {invoices.slice(0, 5).map((inv) => (
                        <div key={inv.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                          <div className="p-1.5 bg-slate-100 rounded-lg"><CreditCard className="w-3.5 h-3.5 text-slate-500" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800">{inv.period_start || inv.created_date?.split("T")[0]}</p>
                            <p className="text-[10px] text-slate-400">{inv.stripe_invoice_id}</p>
                          </div>
                          <span className="text-sm font-bold text-slate-800">${(inv.amount / 100).toFixed(2)}</span>
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full capitalize">{inv.status}</span>
                          {inv.invoice_pdf && (
                            <a href={inv.invoice_pdf} target="_blank" rel="noreferrer" className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                              <Download className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}