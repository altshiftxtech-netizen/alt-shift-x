import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lock, ShieldCheck } from "lucide-react";

// Blackstone Disclaimer overlay for the PM-1A Install Wizard.
// Renders the mandatory disclaimer in the 16pt / 14pt / 12pt Times New Roman
// standard per the Blackstone Protocol before the "Accept & Initialize"
// button is enabled.
//
// Typography:
//   16pt — section headings  (~21px)
//   14pt — body text         (~19px)
//   12pt — fine print / legal (~16px)

const TIMES = { fontFamily: '"Times New Roman", Times, serif' };

export default function BlackstoneDisclaimerOverlay({ open, onAccept, onCancel }) {
  const [accepted, setAccepted] = useState(false);

  // Reset acceptance each time the overlay opens — the user must re-acknowledge
  // every time the Install Wizard is presented.
  useEffect(() => {
    if (open) setAccepted(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-600 rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-700">
          <Lock className="w-4 h-4 text-red-500" />
          <h2 style={{ ...TIMES, fontSize: "16pt" }} className="font-bold text-slate-100">
            Blackstone Protocol — Mandatory Disclaimer
          </h2>
        </div>

        {/* Scrollable disclaimer body */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4">
            <p style={{ ...TIMES, fontSize: "14pt" }} className="text-slate-300 leading-relaxed">
              This artifact is governed by the Blackstone Protocol. Use is restricted to authorized
              Sovereign operators. Export-controlled. Contains sensitive intelligence. Unauthorized
              use, distribution, or reverse engineering is prohibited and may constitute a federal
              offense. The operator assumes full liability for all downstream actions taken with
              this artifact.
            </p>

            <div className="space-y-1.5">
              <h3 style={{ ...TIMES, fontSize: "16pt" }} className="font-bold text-slate-200">
                Binding Terms
              </h3>
              <ul style={{ ...TIMES, fontSize: "14pt" }} className="text-slate-400 space-y-1 list-disc list-inside leading-relaxed">
                <li>Blackstone Protocol v1.0</li>
                <li>Export Control Classification (EAR / ITAR)</li>
                <li>Sensitive Intelligence Policy</li>
                <li>Sovereign Defense Suite Protocol</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <h3 style={{ ...TIMES, fontSize: "16pt" }} className="font-bold text-slate-200">
                Operator Acknowledgment
              </h3>
              <p style={{ ...TIMES, fontSize: "14pt" }} className="text-slate-300 leading-relaxed">
                By accepting, the operator certifies that they are an authorized Sovereign operator,
                that the deployment environment complies with all export control regulations, and
                that the PM-1A substrate will be operated in accordance with the Sovereign Defense
                Suite protocol at all times.
              </p>
            </div>

            <p style={{ ...TIMES, fontSize: "12pt" }} className="text-slate-500 italic leading-relaxed border-t border-slate-700 pt-3">
              This disclaimer is a mandatory legal instrument under the Blackstone Protocol. It must
              be read in full and explicitly accepted before the PM-1A deployment payload can be
              generated. Acceptance is logged to the Sovereign Ledger as a forensic consent record
              under GSP-MASTER-INDEX-1.0.
            </p>
          </div>
        </ScrollArea>

        {/* Acceptance checkbox + actions */}
        <div className="px-6 py-4 border-t border-slate-700 space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-slate-800 text-red-600 focus:ring-red-600"
            />
            <span style={{ ...TIMES, fontSize: "14pt" }} className="text-slate-300 leading-relaxed">
              I have read and understood the Blackstone Protocol disclaimer and accept all terms
              and liabilities as a condition of generating the PM-1A deployment payload.
            </span>
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              style={{ ...TIMES, fontSize: "14pt" }}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <div className="flex-1" />
            <button
              onClick={onAccept}
              disabled={!accepted}
              style={{ ...TIMES, fontSize: "14pt" }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              // Industrial Matte: Navy bg, Platinum text, Crimson accent when enabled
              // (inline style to avoid Tailwind purge on dynamic classes)
              >
              <span
                className="flex items-center gap-2"
                style={{
                  backgroundColor: accepted ? "#1a2332" : "#1e293b",
                  color: accepted ? "#e2e8f0" : "#64748b",
                  borderColor: accepted ? "#dc2626" : "#475569",
                  border: "1px solid",
                  padding: "8px 20px",
                  borderRadius: "8px",
                }}
              >
                <ShieldCheck className="w-4 h-4" style={{ color: accepted ? "#dc2626" : "#475569" }} />
                Accept &amp; Initialize
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}