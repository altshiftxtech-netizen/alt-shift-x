import React, { useState } from "react";
import { X, FileText, ShieldCheck, Loader2, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";

// $10 one-time unlock modal for the ESI legal record (non-paying users).
export default function EsiUnlockModal({ conversation, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startCheckout = async () => {
    if (window.self !== window.top) {
      setError("Checkout is only available from the published app. Please open the live URL.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("createEsiCheckout", {
        conversationId: conversation.id,
        conversationName: conversation.metadata?.name || "BOB Project",
      });
      if (res.data?.url) window.location.href = res.data.url;
      else setError("Could not start checkout. Please try again.");
    } catch {
      setError("Could not start checkout. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-violet-700/50 rounded-2xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-emerald-900/40 border border-emerald-700/50 flex items-center justify-center mb-4">
          <FileText className="w-6 h-6 text-emerald-400" />
        </div>

        <h3 className="text-lg font-black text-white mb-1">Unlock ESI Legal Record</h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Download a formal, timestamped <strong className="text-slate-200">Electronically Stored Information (ESI)</strong> record
          of this project — including full metadata, a complete entry log, a SHA-256 integrity hash, and a custodian attestation
          you can use to substantiate that a business is being operated.
        </p>

        <div className="bg-slate-800 rounded-xl p-3 mb-4 space-y-1.5">
          {[
            "Timestamped, court-formatted PDF",
            "Chain-of-custody & integrity hash",
            "Custodian attestation statement",
            "Full project work record",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-[11px] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> {f}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-400">One-time export</span>
          <span className="text-2xl font-black text-white">$10</span>
        </div>

        {error && <p className="text-[11px] text-red-400 mb-3">{error}</p>}

        <button
          onClick={startCheckout}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-violet-700 hover:opacity-90 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          {loading ? "Starting checkout…" : "Unlock for $10"}
        </button>
        <p className="text-[10px] text-slate-500 text-center mt-2">
          Paid subscribers download ESI records for free.
        </p>
      </div>
    </div>
  );
}