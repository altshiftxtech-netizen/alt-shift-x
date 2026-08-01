import React from "react";
import { Lock, ShieldCheck, Loader2, Sparkles } from "lucide-react";

// Inline denied/seal state — shown when the gate returns 'denied' or 'unverified'.
// Honors the spec: show the denied state inline WITHOUT redirect.
export default function BobbyGate({ sealStatus, onSeal, sealing }) {
  const isDenied = sealStatus === "denied";

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="relative max-w-md w-full rounded-2xl border border-[#D4AF37]/30 bg-[#0a0a0a]/80 backdrop-blur-xl p-8 text-center overflow-hidden">
        {/* gold corner brackets */}
        <span className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#D4AF37]/50" />
        <span className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#D4AF37]/50" />
        <span className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#D4AF37]/50" />
        <span className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#D4AF37]/50" />

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/5 mb-5">
          <Lock className="w-8 h-8 text-[#D4AF37]" />
        </div>

        <p className="text-[10px] tracking-[0.3em] text-[#D4AF37]/80 mb-2">SOV-AUTH-SEAL-CERT-1.0</p>
        <h2 className="text-xl font-black text-white mb-2">
          {isDenied ? "Access Denied" : "Session Unsealed"}
        </h2>
        <p className="text-xs text-white/55 leading-relaxed mb-6">
          {isDenied
            ? "This module requires a sealed SubstrateSession. All data streams have been nullified by the gate."
            : "Your session is not sealed. Seal it to authorize the BOBby core and yield documents from the Sovereign Substrate."}
        </p>

        <button
          onClick={onSeal}
          disabled={sealing}
          className="w-full h-11 rounded-lg font-bold tracking-[0.15em] text-xs bg-[#D4AF37] hover:bg-[#e6c454] text-black transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(212,175,55,0.3)]"
        >
          {sealing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> SEALING…
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" /> SEAL MY SESSION
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-white/35">
          <Sparkles className="w-3 h-3 text-[#D4AF37]/60" />
          <span>Sealing authorizes all enabled modules in the registry.</span>
        </div>
      </div>
    </div>
  );
}