import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { Zap, Loader2, AlertTriangle } from "lucide-react";

const PLAN_LIMITS = { starter: 1000, pro: 10000, enterprise: null };
const PLAN_LABELS = { starter: "Starter", pro: "Pro", enterprise: "Enterprise" };

export default function ApiQuotaBar() {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke("getSubscription", {})
      .then(res => { setSub(res.data?.subscription || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-4 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
        </CardContent>
      </Card>
    );
  }

  if (!sub) {
    return (
      <Link to="/pricing">
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-violet-200">
          <CardContent className="py-3 flex items-center gap-3">
            <Zap className="w-4 h-4 text-violet-500" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-800">No Active Plan</p>
              <p className="text-[10px] text-violet-600 hover:underline">Subscribe to get API access →</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  const limit = PLAN_LIMITS[sub.plan];
  const used = sub.api_calls_used || 0;
  const pct = limit ? Math.min((used / limit) * 100, 100) : 0;
  const barColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-violet-600";
  const textColor = pct >= 90 ? "text-red-600" : pct >= 70 ? "text-amber-600" : "text-violet-700";

  return (
    <Link to="/dashboard/subscription">
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-xs font-semibold text-slate-800">{PLAN_LABELS[sub.plan]} Plan</span>
            </div>
            <span className={`text-[10px] font-bold ${textColor}`}>
              {limit ? `${Math.round(pct)}%` : "∞"}
            </span>
          </div>
          {limit ? (
            <>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-slate-400">{used.toLocaleString()} used</span>
                <span className="text-[10px] text-slate-400">{limit.toLocaleString()} limit</span>
              </div>
              {pct >= 90 && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-red-600">
                  <AlertTriangle className="w-3 h-3" /> Quota almost full — upgrade now
                </div>
              )}
            </>
          ) : (
            <p className="text-[10px] text-slate-400">Unlimited API calls</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}