import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, ShieldCheck, Loader2, CheckCircle2, ScanLine, RotateCcw } from "lucide-react";

const GOLD = "#C8A95B";
const money = (n) => `$${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Step 3 — Forensic Review. Shows the total and, once issued via
 * SOVEREIGN-INVOICE-ENGINE-1.0, the generated QR metadata { inv, date, tcv,
 * hub, hash } that lets a scanning agent skip "Read PDF" and go straight to
 * Logic Ingestion.
 */
export default function ForensicReviewStep({ policy, billTo, items, issuing, issued, error, onBack, onIssue, onReset }) {
  const total = items.reduce((sum, r) => sum + (Number(r.subtotal) || (Number(r.unit_rate) || 0) * (Number(r.quantity) || 0)), 0);
  const qr = issued?.qr;
  const qrPayload = issued?.qr_payload;

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-1" style={{ color: GOLD }}>Forensic Review</p>
      <h3 className="text-lg font-bold text-white mb-1">
        {issued ? "Invoice issued" : "Confirm & issue"}
      </h3>
      <p className="text-xs text-white/50 mb-5">
        {issued
          ? "Bit-stamped and ready. Scanning agents ingest the QR payload directly — no PDF read required."
          : "Review the total, then issue to generate the forensic QR metadata."}
      </p>

      <div className="grid md:grid-cols-[1fr_auto] gap-6">
        {/* Summary */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap gap-x-6 gap-y-1 mb-3 text-xs">
            <span className="text-white/45">Policy: <span className="text-white/80 font-semibold">{policy?.policy_name || "—"}</span></span>
            {policy?.hub && <span className="text-white/45">Hub: <span className="text-white/80 font-semibold">{policy.hub}</span></span>}
            {billTo && <span className="text-white/45">Bill to: <span className="text-white/80 font-semibold">{billTo}</span></span>}
            {issued?.invoice?.invoice_number && (
              <span className="text-white/45">Invoice: <span className="text-[#E6C878] font-semibold">{issued.invoice.invoice_number}</span></span>
            )}
          </div>
          <div className="divide-y divide-white/5">
            {items.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 text-sm">
                <div className="min-w-0">
                  <p className="text-white/90 truncate">{r.item_name}</p>
                  {r.description && <p className="text-[11px] text-white/40 truncate">{r.description}</p>}
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="text-[11px] text-white/40">{money(r.unit_rate)} × {r.quantity}</span>
                  <p className="text-sm font-semibold text-white">{money(r.subtotal ?? (r.unit_rate * r.quantity))}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <span className="text-sm font-semibold text-white/70">Total Contract Value</span>
            <span className="text-2xl font-black text-[#E6C878]">{money(total)}</span>
          </div>
        </div>

        {/* QR metadata */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#C8A95B]/25 bg-black/40 p-5 min-w-[220px]">
          {issued && qr ? (
            <>
              <div className="rounded-lg bg-white p-3">
                <QRCodeSVG value={qrPayload} size={148} level="M" />
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-[11px] font-semibold text-emerald-400">
                <ScanLine className="w-3.5 h-3.5" /> AI-Ingestion QR
              </div>
              <pre className="mt-3 w-full max-w-[220px] overflow-x-auto rounded-lg bg-white/5 border border-white/10 p-2.5 text-[10px] leading-relaxed text-[#E8DFC8]" style={{ fontFamily: "'Courier New', monospace" }}>
{JSON.stringify(qr, null, 2)}
              </pre>
            </>
          ) : (
            <div className="text-center text-white/40">
              <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-40" style={{ color: GOLD }} />
              <p className="text-xs">The forensic QR generates<br />once the invoice is issued.</p>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-400 mt-4">{error}</p>}

      <div className="flex items-center justify-between mt-6">
        {!issued ? (
          <>
            <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white">
              <ArrowLeft className="w-4 h-4" /> Itemization
            </button>
            <button
              onClick={onIssue}
              disabled={issuing}
              className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-bold text-[#0A0A0C] disabled:opacity-60"
              style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})` }}
            >
              {issuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {issuing ? "Issuing…" : "Issue Forensic Invoice"}
            </button>
          </>
        ) : (
          <>
            <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Issued · {issued.invoice?.forensic_hash}
            </div>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 hover:text-white hover:border-white/30"
            >
              <RotateCcw className="w-4 h-4" /> New invoice
            </button>
          </>
        )}
      </div>
    </div>
  );
}