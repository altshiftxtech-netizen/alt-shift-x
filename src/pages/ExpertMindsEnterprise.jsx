import React from "react";
import { Link } from "react-router-dom";
import { Loader2, Brain } from "lucide-react";
import useSovereignAccess from "@/hooks/useSovereignAccess";
import SovereignPaywall from "@/components/enterprise/SovereignPaywall";
import EnterpriseNavMenu from "@/components/enterprise/EnterpriseNavMenu";
import ExpertMindsEnterpriseTab from "@/components/enterprise/expertminds/ExpertMindsEnterpriseTab";
import EmLegalRepository from "@/components/expertmind/legal/EmLegalRepository";

const SOVEREIGN_LOGO = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/441b5ba88_generated_image.png";

/**
 * ExpertMindsEnterprise — standalone Sovereign page for the ExpertMinds
 * Enterprise package (previously a tab inside /enterprise). Same access gate
 * and masthead styling as the Enterprise dashboard.
 */
export default function ExpertMindsEnterprise() {
  const { status, user } = useSovereignAccess();

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-[#05060a]"><Loader2 className="w-6 h-6 animate-spin text-[#C8A95B]/60" /></div>;
  }
  if (status === "guest") return <SovereignPaywall isGuest />;
  if (status === "denied") return <SovereignPaywall />;

  return (
    <div className="min-h-screen text-white relative" style={{ background: "radial-gradient(ellipse at 50% -10%, #131824, #05060a 60%)" }}>
      {/* Sovereign background video */}
      <video
        className="fixed inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
        src="https://media.base44.com/videos/public/6a19363c90f06323c4cfff73/50b819bd5_958ded668_generated_video.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="fixed inset-0 bg-black/60 z-0 pointer-events-none" />

      <div className="relative z-10">
        {/* Sovereign masthead */}
        <div className="border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl" style={{ background: "rgba(5,6,10,0.75)" }}>
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
            <img src={SOVEREIGN_LOGO} alt="Alt+Shift+X" className="h-9 w-auto object-contain" draggable="false" />
            <div className="flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#C8A95B] leading-none">Sovereign Tier</p>
              <h1 className="text-base font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>ExpertMinds Enterprise</h1>
            </div>
            <Link to="/enterprise" className="text-xs text-white/50 hover:text-white hidden sm:block">Enterprise</Link>
            <EnterpriseNavMenu user={user} />
          </div>
        </div>

        {/* Hero */}
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5" style={{ background: "rgba(200,169,91,0.1)", border: "1px solid rgba(200,169,91,0.25)" }}>
            <Brain className="w-3.5 h-3.5 text-[#E6C878]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E6C878]">Org Master License</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Enterprise-grade<br /><span className="text-[#E6C878]">expert intelligence.</span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto mt-4 text-sm sm:text-base">
            Sign the Blackstone Enterprise Agreement, activate your core subscription, then provision member seats — each activated by a Vana-Voice biological handshake.
          </p>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-6 py-8 pb-10">
          <ExpertMindsEnterpriseTab />
        </div>

        {/* Legal Repository footer */}
        <div className="max-w-3xl mx-auto px-6 pb-20">
          <EmLegalRepository variant="dark" />
        </div>
      </div>
    </div>
  );
}