import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown, ChevronRight, Download, CheckCircle2,
  Clock, AlertCircle, Loader2,
} from "lucide-react";

const statusConfig = {
  completed: {
    label: "Paid",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  failed: {
    label: "Failed",
    icon: AlertCircle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

function PayoutRow({ payout }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[payout.status] || statusConfig.pending;
  const StatusIcon = cfg.icon;

  return (
    <>
      <tr
        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-2">
            {expanded
              ? <ChevronDown className="w-4 h-4 text-slate-400" />
              : <ChevronRight className="w-4 h-4 text-slate-400" />
            }
            <div>
              <p className="text-sm font-semibold text-slate-800">{payout.period}</p>
              <p className="text-xs text-slate-400">{payout.id}</p>
            </div>
          </div>
        </td>
        <td className="py-3.5 px-4 text-sm text-slate-600">
          ${payout.gross.toLocaleString()}
        </td>
        <td className="py-3.5 px-4 text-sm text-slate-400">
          -${payout.platformFee.toLocaleString()}
        </td>
        <td className="py-3.5 px-4">
          <span className="text-sm font-bold text-slate-900">${payout.net.toLocaleString()}</span>
        </td>
        <td className="py-3.5 px-4">
          <Badge
            variant="outline"
            className={`text-xs font-semibold flex items-center gap-1 w-fit ${cfg.className}`}
          >
            <StatusIcon className={`w-3 h-3 ${payout.status === "processing" ? "animate-spin" : ""}`} />
            {cfg.label}
          </Badge>
        </td>
        <td className="py-3.5 px-4 text-sm text-slate-400">
          {payout.paidAt || "—"}
        </td>
        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-600 h-7 px-2"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-slate-50 border-b border-slate-100">
          <td colSpan={7} className="px-4 pb-4 pt-2">
            <div className="ml-6 rounded-xl border border-slate-200 overflow-hidden bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-2.5 px-4 font-semibold text-slate-500 uppercase tracking-wider">Component</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-slate-500 uppercase tracking-wider">Installs</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-slate-500 uppercase tracking-wider">Gross</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-slate-500 uppercase tracking-wider">Platform Fee</th>
                    <th className="text-right py-2.5 px-4 font-semibold text-slate-500 uppercase tracking-wider">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {payout.lineItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-0">
                      <td className="py-2.5 px-4 text-slate-700 font-medium">{item.component}</td>
                      <td className="py-2.5 px-4 text-right text-slate-500">{item.installs.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right text-slate-600">${item.revenue.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right text-slate-400">-${item.fee.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-800">${item.net.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-700" colSpan={2}>Total</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-slate-700">${payout.gross.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-slate-400">-${payout.platformFee.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">${payout.net.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function PayoutHistoryTable({ payouts }) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold text-slate-800">Payout History</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Click any row to view line items</span>
            <Button variant="outline" size="sm" className="text-xs border-slate-200 text-slate-600 h-7 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Period</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Fee</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Payout</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid On</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <PayoutRow key={payout.id} payout={payout} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 rounded-b-xl">
          <span>Showing {payouts.length} payouts</span>
          <span>
            Lifetime net: <strong className="text-slate-800">
              ${payouts.reduce((s, p) => s + p.net, 0).toLocaleString()}
            </strong>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}