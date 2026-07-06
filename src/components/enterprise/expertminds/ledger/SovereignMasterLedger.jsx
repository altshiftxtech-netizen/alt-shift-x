import React, { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCw, Database, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import MatrixRainHeader from "./MatrixRainHeader";
import ForensicHashModal from "./ForensicHashModal";

const GOLD = "#C8A95B";
const LEDGER_CODE = "SOVEREIGN-MASTER-LEDGER-1.0";

const TYPE_STYLE = {
  "PRINT":      { color: "#F4E3B0", bg: "rgba(200,169,91,0.12)" },
  "LEG-ACCEPT": { color: "#a5b4fc", bg: "rgba(99,102,241,0.14)" },
  "FIN-TRANS":  { color: "#6ee7b7", bg: "rgba(16,185,129,0.14)" },
};
const STATUS_STYLE = {
  PROCESSING: "#fbbf24",
  PENDING:    "#fbbf24",
  ACCEPTED:   "#6ee7b7",
  CHARGED:    "#6ee7b7",
  COMPLETE:   "#6ee7b7",
  LOGGED:     "#9ca3af",
};

function fmt(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d)) return String(ts);
  return d.toISOString().replace("T", " ").replace("Z", "").slice(0, 19);
}

/**
 * SovereignMasterLedger — SOVEREIGN-MASTER-LEDGER-1.0 data grid for the
 * Sovereign Private Portal. Shows the current Enterprise org's immutable event
 * stream: Print (PROCESSING), Legal (LEG-ACCEPT), Financial (FIN-TRANS).
 * Mono-spaced grid, alternating deep-gray rows, click any hash for its raw JSON.
 */
export default function SovereignMasterLedger() {
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("expertMindsOrgOps", { action: "master_ledger" });
      if (res.data?.ok) {
        setOrg(res.data.org);
        setRows(res.data.rows || []);
      }
    } catch { /* keep prior state */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: `${GOLD}33`, background: "#0b0a07" }}>
      <MatrixRainHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}55` }}>
              <Database className="w-5 h-5" style={{ color: GOLD }} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>{LEDGER_CODE}</p>
              <h4 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Master Ledger</h4>
              <p className="text-[11px] text-white/45 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" style={{ color: GOLD }} />
                {org?.org_name ? `${org.org_name} · active bit-stamping` : "Enterprise event stream"}
              </p>
            </div>
          </div>
          <button onClick={load} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10" title="Refresh ledger">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </MatrixRainHeader>

      {/* Data grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-[11px]">
          <thead>
            <tr className="text-white/40 uppercase tracking-wider" style={{ background: "#111010" }}>
              <th className="px-4 py-2.5 font-semibold">Timestamp</th>
              <th className="px-4 py-2.5 font-semibold">Event Type</th>
              <th className="px-4 py-2.5 font-semibold">User/Agent ID</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
              <th className="px-4 py-2.5 font-semibold">Forensic Hash</th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-white/40">
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              </td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-white/35">
                {org ? "No events recorded for this organization yet." : "No Enterprise organization associated with your account."}
              </td></tr>
            ) : (
              rows.map((r, i) => {
                const ts = TYPE_STYLE[r.event_type] || { color: "#d1d5db", bg: "rgba(255,255,255,0.06)" };
                return (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.03)" }} className="border-t border-white/5">
                    <td className="px-4 py-2.5 text-white/60 whitespace-nowrap">{fmt(r.timestamp)}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-block rounded px-2 py-0.5 font-bold" style={{ color: ts.color, background: ts.bg }}>{r.event_type}</span>
                    </td>
                    <td className="px-4 py-2.5 text-white/55 max-w-[180px] truncate" title={r.actor}>{r.actor}</td>
                    <td className="px-4 py-2.5 font-bold" style={{ color: STATUS_STYLE[r.status] || "#9ca3af" }}>{r.status}</td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => setSelected(r)}
                        className="text-[10px] hover:underline"
                        style={{ color: GOLD }}
                        title="View raw JSON bit-stamp"
                      >
                        {r.forensic_hash}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ForensicHashModal row={selected} onClose={() => setSelected(null)} />
    </div>
  );
}