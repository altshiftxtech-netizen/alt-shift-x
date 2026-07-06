import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSovereignAccess from "@/hooks/useSovereignAccess";
import SovereignPaywall from "@/components/enterprise/SovereignPaywall";
import EnterpriseNavMenu from "@/components/enterprise/EnterpriseNavMenu";
import EnterprisePipelineCard from "@/components/enterprise/pipelines/EnterprisePipelineCard";
import { ENTERPRISE_PIPELINES, ENTERPRISE_MASTER_SUITE } from "@/components/enterprise/pipelines/enterprisePipelines";

const SOVEREIGN_LOGO = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/441b5ba88_generated_image.png";
const GOLD = "#E6C878";

/**
 * The Sovereign Exclusive Pipelines — seven elite Gen-2 pipelines plus the
 * Master Suite bundle, gated to the Sovereign / Enterprise tier. Set up by Bob.
 */
export default function EnterprisePipelines() {
  const { status, user } = useSovereignAccess();
  const [selected, setSelected] = useState(null);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-[#05060a]"><Loader2 className="w-6 h-6 animate-spin text-[#C8A95B]/60" /></div>;
  }
  if (status === "guest") return <SovereignPaywall isGuest />;
  if (status === "denied") return <SovereignPaywall />;

  const onSelect = (p) => setSelected(p);

  return (
    <div className="min-h-screen text-white relative" style={{ background: "radial-gradient(ellipse at 50% -10%, #131824, #05060a 60%)" }}>
      <video
        className="fixed inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
        src="https://media.base44.com/videos/public/6a19363c90f06323c4cfff73/5a28790a3_254cd1cd6_generated_video.mp4"
        autoPlay muted loop playsInline
      />
      <div className="fixed inset-0 bg-black/60 z-0 pointer-events-none" />

      <div className="relative z-10">
        {/* Masthead with user bubble dropdown */}
        <div className="border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl" style={{ background: "rgba(5,6,10,0.75)" }}>
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
            <img src={SOVEREIGN_LOGO} alt="Alt+Shift+X" className="h-9 w-auto object-contain" draggable="false" />
            <div className="flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#C8A95B] leading-none">Sovereign Tier</p>
              <h1 className="text-base font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Exclusive Pipelines</h1>
            </div>
            <EnterpriseNavMenu user={user} />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link
            to="/enterprise"
            className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-black/40 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Command Deck
          </Link>

          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
              style={{ background: `${GOLD}1a`, border: `1px solid ${GOLD}44`, color: GOLD }}
            >
              <Sparkles className="w-3.5 h-3.5" /> Sovereign Exclusive Pipelines
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Gen-2 Sovereign Seven
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
              The highest-tier pipelines on the platform — built on the "Expertminds" lineage, set up and tuned by Bob.
              Locked to the Sovereign registry, each licensed behind a single secure key.
            </p>
          </div>

          {/* The seven */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {ENTERPRISE_PIPELINES.map((p) => (
              <EnterprisePipelineCard key={p.key} pipeline={p} onSelect={onSelect} />
            ))}
          </div>

          {/* The Master Suite bundle */}
          <div
            className="relative rounded-2xl p-8 md:p-10 overflow-hidden text-center"
            style={{
              border: `2px solid ${GOLD}`,
              background: "linear-gradient(180deg, rgba(19,24,36,0.6) 0%, rgba(10,10,12,0.75) 100%)",
              boxShadow: `0 0 60px ${GOLD}33`,
            }}
          >
            <span className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: `${GOLD}22` }} />
            <div className="relative z-10">
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: `${GOLD}1a`, border: `1px solid ${GOLD}55` }}>
                <Crown className="w-7 h-7" style={{ color: GOLD }} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: GOLD }}>Best Value · Save 10%</p>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                {ENTERPRISE_MASTER_SUITE.name}
              </h2>
              <p className="text-white/60 max-w-xl mx-auto mb-5 italic">"{ENTERPRISE_MASTER_SUITE.pitch}"</p>

              <div className="flex items-baseline justify-center gap-3 mb-6">
                <span className="text-4xl font-black text-white">${ENTERPRISE_MASTER_SUITE.price.toLocaleString()}</span>
                <span className="text-lg text-white/50">/mo</span>
                <span className="text-sm text-white/40 line-through">${ENTERPRISE_MASTER_SUITE.combined.toLocaleString()}</span>
              </div>

              <Button
                onClick={() => onSelect(ENTERPRISE_MASTER_SUITE)}
                className="font-bold px-8 hover:opacity-90"
                style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})`, color: "#0A0A0C" }}
              >
                License the Master Suite
              </Button>
            </div>
          </div>

          {selected && (
            <div className="mt-6 text-center text-sm text-white/50">
              Selected: <span className="font-semibold text-white">{selected.name}</span> — checkout coming next.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}