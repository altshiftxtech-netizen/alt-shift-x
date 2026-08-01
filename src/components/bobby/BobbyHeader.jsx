import React from "react";
import { ChevronDown, ShieldCheck, Lock, Loader2 } from "lucide-react";

const BOBBY_LOGO = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/24e433342_image.png";

// Header — holds the `bob init` dropdown. On selection, triggers fn_initGate.
// If not sealed, shows a gold lock and the gate handles the denied state inline.
export default function BobbyHeader({ sealStatus, modules, activeModule, onSelectModule, sealing }) {
  const sealed = sealStatus === "sealed";

  return (
    <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-[#D4AF37]/20 bg-black/60 backdrop-blur-md">
      <div className="flex items-center gap-3 min-w-0">
        <img src={BOBBY_LOGO} alt="BOBby" className="w-9 h-9 rounded-lg object-cover shrink-0" />
        <div className="min-w-0">
          <h1 className="text-sm font-black text-white leading-tight truncate">
            BOBby <span className="text-[#D4AF37]">the Build Yielder</span>
          </h1>
          <p className="text-[10px] tracking-[0.2em] text-white/40 hidden sm:block">BUILD YIELD SOLUTIONS</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Seal status badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] tracking-widest font-bold ${
            sealed
              ? "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]"
              : "border-white/15 bg-white/5 text-white/50"
          }`}
        >
          {sealing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : sealed ? (
            <ShieldCheck className="w-3 h-3" />
          ) : (
            <Lock className="w-3 h-3" />
          )}
          {sealed ? "SEALED" : "UNSEALED"}
        </div>

        {/* bob init dropdown */}
        <div className="relative">
          <select
            value={activeModule || ""}
            onChange={(e) => e.target.value && onSelectModule(e.target.value)}
            disabled={!sealed}
            className={`appearance-none pl-3 pr-8 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              sealed
                ? "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 cursor-pointer"
                : "border-white/15 bg-white/5 text-white/40 cursor-not-allowed"
            } focus:outline-none`}
          >
            <option value="">bob init ▸</option>
            {modules.map((m) => (
              <option key={m.key} value={m.key} className="bg-black text-white">
                {m.title}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-[#D4AF37]/60 pointer-events-none" />
        </div>
      </div>
    </header>
  );
}