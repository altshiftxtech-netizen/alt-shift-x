import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Loader2, CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";

const STATUS_STYLE = {
  approved: "bg-emerald-100 text-emerald-700",
  pending:  "bg-amber-100 text-amber-700",
  paid:     "bg-blue-100 text-blue-700",
};

export default function ApprovedSplitsTable({ splits, stripeReady, payoutMethod = "stripe", payoutLoading, onPayout }) {
  const [selected, setSelected] = useState(new Set());
  const [expandedPaid, setExpandedPaid] = useState(false);

  const approved = splits.filter(s => s.status === "approved");
  const paid = splits.filter(s => s.status === "paid");
  const pending = splits.filter(s => s.status === "pending");

  const toggleSelect = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const handlePayoutSelected = () => {
    if (selected.size === 0) onPayout(null); // all
    else onPayout([...selected]);
  };

  const selectedTotal = approved
    .filter(s => selected.size === 0 || selected.has(s.id))
    .reduce((a, s) => a + (s.builder_payout || 0), 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Revenue Splits
          </CardTitle>
          {approved.length > 0 && (
            <div className="flex items-center gap-2">
              {!stripeReady && (
                <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  {payoutMethod === "paypal" ? "Add your PayPal email to enable payouts" : "Connect Stripe to enable payouts"}
                </span>
              )}
              <Button
                onClick={handlePayoutSelected}
                disabled={payoutLoading || !stripeReady}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-2"
                size="sm"
              >
                {payoutLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DollarSign className="w-3.5 h-3.5" />}
                {selected.size > 0 ? `Pay Selected (${selected.size})` : `Pay All Approved`} — ${selectedTotal.toFixed(2)}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">

        {splits.length === 0 && (
          <div className="text-center py-12 text-sm text-slate-400">No revenue splits yet. Run the monthly split process to generate records.</div>
        )}

        {/* Approved */}
        {approved.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-emerald-50 border-y border-emerald-100 text-[11px] font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved — Ready for Payout ({approved.length})
            </div>
            <div className="divide-y divide-slate-50">
              {approved.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={() => toggleSelect(s.id)}
                    className="rounded border-slate-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{s.component_name}</div>
                    <div className="text-[11px] text-slate-400">{s.period} · {s.tier_at_period} tier · {s.builder_pct}% share</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-emerald-700">${(s.builder_payout || 0).toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400">${(s.gross_revenue || 0).toFixed(2)} gross</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-amber-50 border-y border-amber-100 text-[11px] font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Pending Admin Approval ({pending.length})
            </div>
            <div className="divide-y divide-slate-50">
              {pending.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3 opacity-75">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{s.component_name}</div>
                    <div className="text-[11px] text-slate-400">{s.period} · {s.tier_at_period} tier</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-slate-600">${(s.builder_payout || 0).toFixed(2)}</div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${STATUS_STYLE.pending}`}>Pending</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paid history (collapsible) */}
        {paid.length > 0 && (
          <div>
            <button
              onClick={() => setExpandedPaid(!expandedPaid)}
              className="w-full px-4 py-2 bg-blue-50 border-y border-blue-100 text-[11px] font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
            >
              {expandedPaid ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              Paid Out History ({paid.length})
            </button>
            {expandedPaid && (
              <div className="divide-y divide-slate-50">
                {paid.map(s => (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">{s.component_name}</div>
                      <div className="text-[11px] text-slate-400">
                        {s.period} · {s.processed_at ? new Date(s.processed_at).toLocaleDateString() : ""}
                        {s.stripe_transfer_id && <span className="ml-1 font-mono text-[10px] text-slate-300">{s.stripe_transfer_id.slice(0, 14)}…</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-blue-700">${(s.builder_payout || 0).toFixed(2)}</div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${STATUS_STYLE.paid}`}>Paid</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}