import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, X } from "lucide-react";

/**
 * Blackstone secondary disclosure — shown before a DATA_COLLECTION-flagged
 * component download proceeds. The downloader must explicitly acknowledge the
 * data-collection risk before the byte-stream is released.
 */
export default function BlackstoneDisclosureModal({ open, componentName, onAcknowledge, onCancel }) {
  const [checked, setChecked] = useState(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border overflow-hidden" style={{ background: "#0b0d14", borderColor: "#EF444455" }}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10" style={{ background: "rgba(239,68,68,0.08)" }}>
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-400">Blackstone Disclosure</p>
            <h3 className="text-base font-bold text-white">Data Collection Risk Detected</h3>
          </div>
          <button onClick={onCancel} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-white/70">
            The package <span className="font-semibold text-white">{componentName || "this component"}</span> is flagged for
            <span className="text-red-300 font-semibold"> DATA_COLLECTION</span>. This means it may capture, transmit, or retain
            data beyond the immediate export.
          </p>
          <p className="text-xs text-white/50">
            Under the Blackstone protocol, you must acknowledge that you understand the data-collection behavior and accept
            responsibility for its lawful use before the forensically-sealed byte-stream is released. This acknowledgment is
            logged to the hidden FORENSIC-AUDIT-LOG.
          </p>
          <label className="flex items-start gap-2 text-xs text-white/70 cursor-pointer">
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 accent-red-500" />
            I understand and accept the data-collection risk and its lawful-use obligations.
          </label>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-white/10">
          <Button variant="outline" onClick={onCancel} className="text-xs border-white/15 text-white/80 bg-transparent hover:bg-white/10">Cancel</Button>
          <Button disabled={!checked} onClick={onAcknowledge} className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold">Acknowledge & Proceed</Button>
        </div>
      </div>
    </div>
  );
}