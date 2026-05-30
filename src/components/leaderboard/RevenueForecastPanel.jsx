import React from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Loader2, Zap, AlertTriangle, ChevronRight } from "lucide-react";

export default function RevenueForecastPanel({ forecast, loading, onGenerate }) {
  const periods = forecast ? [
    { label: "30 Days", rev: forecast.forecast?.forecast_30d?.revenue, payout: forecast.forecast?.payout_30d, conf: forecast.forecast?.forecast_30d?.confidence },
    { label: "60 Days", rev: forecast.forecast?.forecast_60d?.revenue, payout: forecast.forecast?.payout_60d, conf: forecast.forecast?.forecast_60d?.confidence },
    { label: "90 Days", rev: forecast.forecast?.forecast_90d?.revenue, payout: forecast.forecast?.payout_90d, conf: forecast.forecast?.forecast_90d?.confidence },
  ] : [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-50 border border-violet-200 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Revenue Forecast</h3>
            <p className="text-[11px] text-slate-400">AI-powered 90-day projection</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={onGenerate} disabled={loading} className="text-xs gap-1.5">
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
          {forecast ? "Refresh" : "Generate"}
        </Button>
      </div>

      <div className="flex-1 p-6">
        {!forecast && !loading && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <div className="w-12 h-12 bg-violet-50 border border-violet-200 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-violet-400" />
            </div>
            <p className="text-sm text-slate-500 max-w-xs">
              Generate a predictive 30/60/90-day revenue forecast based on your component portfolio and platform trends.
            </p>
            <Button onClick={onGenerate} className="bg-violet-700 hover:bg-violet-800 text-white text-xs" size="sm">
              Generate Forecast →
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            <p className="text-xs text-slate-400">Analyzing portfolio & platform trends…</p>
          </div>
        )}

        {forecast && !loading && (
          <div className="space-y-5">
            {/* Current baseline */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Current monthly revenue</span>
              <span className="font-bold text-slate-900">${(forecast.current_monthly_revenue || 0).toLocaleString()}</span>
            </div>

            {/* 30/60/90 projections */}
            <div className="space-y-2.5">
              {periods.map(p => (
                <div key={p.label} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-600">{p.label}</span>
                    <span className="text-[10px] text-slate-400">~{p.conf || 70}% confidence</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-lg font-black text-emerald-700">${(p.rev || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">Your payout: <span className="text-violet-700 font-semibold">${(p.payout || 0).toLocaleString()}</span></div>
                    </div>
                    <div className="w-full max-w-[80px]">
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, p.conf || 70)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Growth drivers */}
            {forecast.forecast?.growth_drivers?.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Growth Drivers</div>
                <ul className="space-y-1">
                  {forecast.forecast.growth_drivers.slice(0, 3).map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                      <ChevronRight className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />{d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Churn risks */}
            {forecast.forecast?.churn_risks?.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Risks</div>
                <ul className="space-y-1">
                  {forecast.forecast.churn_risks.slice(0, 2).map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-amber-700">
                      <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Top recommendation */}
            {forecast.forecast?.recommended_action && (
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-[11px] text-violet-800 leading-relaxed">
                <span className="font-bold">Recommended: </span>
                {forecast.forecast.recommended_action}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}