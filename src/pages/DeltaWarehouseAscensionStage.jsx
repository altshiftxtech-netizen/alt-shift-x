import React from "react";
import WarehouseBlackHole from "@/components/warehouse/WarehouseBlackHole";
import { Shield, Zap } from "lucide-react";
import ZeroCreditSearchEngine from "@/components/warehouse/ZeroCreditSearchEngine";

/**
 * DeltaWarehouseAscensionStage
 * Sovereign Turnkey Productions — dimensional experience for high-value
 * production artifacts ($10K – $1M+). Features an interactive cinematic
 * black hole, floating Delta header with multi-sig escrow
 * indicator, and the zero-credit database search engine.
 */
export default function DeltaWarehouseAscensionStage() {


  return (
    <div className="relative min-h-screen w-full bg-[#030306] overflow-hidden text-white font-sans">
      <WarehouseBlackHole />

      {/* Floating Delta Header */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-10 py-6 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <img
            src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/02ef24436_generated_image.png"
            alt="Delta Warehouse"
            className="h-12 md:h-14 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-3 md:gap-4 text-xs font-mono">
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Shield className="w-3 h-3" /> MULTI-SIG ESCROW ACTIVE ($10K - $1M+)
          </span>
          <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Connect Kyber-1024 Vault
          </button>
        </div>
      </div>

      {/* Zero-Credit Database Search Engine */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <ZeroCreditSearchEngine />
      </div>
    </div>
  );
}