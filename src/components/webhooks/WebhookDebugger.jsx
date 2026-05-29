import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bug, Send, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";

const TEST_EVENTS = [
  { key: "component.published", label: "Component Published", payload: { component_id: "test-123", component_name: "Test Component", version: "1.0.0" } },
  { key: "component.version.released", label: "Version Released", payload: { component_id: "test-123", version: "1.1.0", breaking_change: false } },
  { key: "subscription.upgraded", label: "Subscription Upgraded", payload: { subscriber_id: "user-abc", from_tier: "starter", to_tier: "pro" } },
  { key: "invoice.paid", label: "Invoice Paid", payload: { invoice_id: "inv-001", amount_usd: 299, period: "2026-05" } },
  { key: "extraction.completed", label: "Extraction Completed", payload: { component_id: "test-123", job_id: "job-xyz", fields_extracted: 14 } },
  { key: "trust_score.changed", label: "Trust Score Changed", payload: { component_id: "test-123", old_score: 82, new_score: 91 } },
  { key: "budget.alert.triggered", label: "Budget Alert", payload: { category: "Materials", threshold_pct: 85, current_spend: 42500 } },
];

export default function WebhookDebugger({ subId }) {
  const [selectedEvent, setSelectedEvent] = useState(TEST_EVENTS[0]);
  const [customPayload, setCustomPayload] = useState(JSON.stringify(TEST_EVENTS[0].payload, null, 2));
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const handleEventChange = (ev) => {
    setSelectedEvent(ev);
    setCustomPayload(JSON.stringify(ev.payload, null, 2));
  };

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    let payload;
    try { payload = JSON.parse(customPayload); } catch { setResult({ ok: false, error: "Invalid JSON in payload" }); setSending(false); return; }

    const res = await base44.functions.invoke("dispatchWebhook", {
      event_type: selectedEvent.key,
      payload,
      target_subscription_id: subId,
    });

    if (res.data?.dispatched !== undefined) {
      setResult({ ok: true, dispatched: res.data.dispatched, delivered: res.data.delivered, failed: res.data.failed, event_id: res.data.event_id });
    } else {
      setResult({ ok: false, error: res.data?.error || "Dispatch failed" });
    }
    setSending(false);
  };

  return (
    <Card className="border-blue-200 mt-4">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-blue-800 flex items-center gap-2">
            <Bug className="w-4 h-4 text-blue-600" /> Webhook Debugger
          </CardTitle>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
        {!expanded && <p className="text-[10px] text-slate-400 mt-0.5">Send a test event to this endpoint</p>}
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Test Event Type</label>
            <div className="grid grid-cols-2 gap-1.5">
              {TEST_EVENTS.map(ev => (
                <button key={ev.key} onClick={() => handleEventChange(ev)}
                  className={`text-left text-xs px-3 py-2 rounded-lg border transition-all ${selectedEvent.key === ev.key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
                  {ev.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Payload (JSON)</label>
            <textarea value={customPayload} onChange={e => setCustomPayload(e.target.value)}
              rows={5} className="w-full font-mono text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50 resize-none" />
          </div>

          <Button onClick={handleSend} disabled={sending} className="bg-blue-600 hover:bg-blue-700 gap-2 text-sm w-full">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Test Event
          </Button>

          {result && (
            <div className={`rounded-xl px-4 py-3 text-xs ${result.ok ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
              {result.ok ? (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-800">Dispatch successful</p>
                    <p className="text-emerald-700 mt-0.5">
                      {result.dispatched} dispatched · {result.delivered} delivered · {result.failed} failed
                    </p>
                    <p className="text-emerald-600 font-mono mt-0.5 text-[10px]">event_id: {result.event_id}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-red-800">Dispatch failed</p>
                    <p className="text-red-700 mt-0.5">{result.error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}