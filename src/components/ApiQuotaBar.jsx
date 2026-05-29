import React from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const PLAN_LIMITS = {
  starter: { label: "Starter", limit: 1000 },
  pro: { label: "Pro", limit: 10000 },
  enterprise: { label: "Enterprise", limit: Infinity },
};

// Mock: in a real app this would come from the user's subscription record
const MOCK_SUBSCRIPTION = {
  plan: "pro",
  used: 6843,
};

export default function ApiQuotaBar({ plan = MOCK_SUBSCRIPTION.plan, used = MOCK_SUBSCRIPTION.used }) {
  const planConfig = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
  const isUnlimited = planConfig.limit === Infinity;
  const pct = isUnlimited ? 0 : Math.min((used / planConfig.limit) * 100, 100);

  const barColor =
    pct >= 90 ? "bg-red-500" :
    pct >= 70 ? "bg-amber-500" :
    "bg-violet-600";

  const textColor =
    pct >= 90 ? "text-red-600" :
    pct >= 70 ? "text-amber-600" :
    "text-violet-700";

  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-100">
              <Zap className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">API Quota</p>
              <p className="text-[10px] text-slate-400">{planConfig.label} plan · resets monthly</p>
            </div>
          </div>
          <Link to="/pricing" className="flex items-center gap-0.5 text-[10px] text-violet-700 hover:underline font-semibold">
            Upgrade <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {isUnlimited ? (
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">Unlimited calls on Enterprise</div>
            <span className="text-xs font-bold text-emerald-600">{used.toLocaleString()} used</span>
          </div>
        ) : (
          <>
            {/* Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Labels */}
            <div className="flex items-center justify-between text-[10px]">
              <span className={`font-bold ${textColor}`}>
                {used.toLocaleString()} <span className="font-normal text-slate-400">/ {planConfig.limit.toLocaleString()} calls used</span>
              </span>
              <span className={`font-semibold ${textColor}`}>{Math.round(pct)}%</span>
            </div>

            {pct >= 90 && (
              <p className="mt-2 text-[10px] text-red-600 font-semibold">
                ⚠ You're nearly at your limit. <Link to="/pricing" className="underline">Upgrade your plan</Link> to avoid interruptions.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}