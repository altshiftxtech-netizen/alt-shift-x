import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import SpeakeasyVideoBackground from "@/components/speakeasy/SpeakeasyVideoBackground";
import SpeakeasyLogo from "@/components/speakeasy/SpeakeasyLogo";
import SpeakeasyPipelineCard from "@/components/pipelines/speakeasy/SpeakeasyPipelineCard";
import { SPEAKEASY_PIPELINES, SPEAKEASY_MASTER_SUITE } from "@/components/pipelines/speakeasy/speakeasyPipelines";

const GOLD = "#C8A95B";

/**
 * The Speakeasy Exclusive Pipelines — the elite Gen-2 quartet plus the Master
 * Suite bundle. Reached from the "Pipelines" portrait in the Proxy Room.
 * Selecting a pipeline opens the existing PurchasePipelineDialog flow.
 */
export default function SpeakeasyPipelines() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  // TODO: wire selected pipeline into checkout. For now we surface the choice.
  const onSelect = (p) => setSelected(p);

  return (
    <div className="min-h-screen relative">
      <SpeakeasyVideoBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Header chrome */}
        <button
          onClick={() => navigate("/speakeasy/proxy-room")}
          className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-black/40 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Founders' Room
        </button>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <SpeakeasyLogo size={30} />
          </div>
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
            style={{ background: `${GOLD}1a`, border: `1px solid ${GOLD}44`, color: GOLD }}
          >
            <Sparkles className="w-3.5 h-3.5" /> Exclusive Speakeasy Pipelines
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            The Gen-2 Quartet
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
            The highest-tier pipelines on the platform — built on the "Expertminds" lineage found in the Speakeasy
            Gallery. Locked to the Speakeasy registry, licensed behind a single secure key.
          </p>
        </div>

        {/* The quartet */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {SPEAKEASY_PIPELINES.map((p) => (
            <SpeakeasyPipelineCard key={p.key} pipeline={p} onSelect={onSelect} />
          ))}
        </div>

        {/* The Master Suite bundle */}
        <div
          className="relative rounded-2xl p-8 md:p-10 overflow-hidden text-center"
          style={{
            border: `2px solid ${GOLD}`,
            background: "linear-gradient(180deg, rgba(42,13,24,0.6) 0%, rgba(10,10,12,0.75) 100%)",
            boxShadow: `0 0 60px ${GOLD}33`,
          }}
        >
          <span className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: `${GOLD}22` }} />
          <div className="relative z-10">
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: `${GOLD}1a`, border: `1px solid ${GOLD}55` }}>
              <Crown className="w-7 h-7" style={{ color: GOLD }} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: GOLD }}>Best Value · Save 13%</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              {SPEAKEASY_MASTER_SUITE.name}
            </h2>
            <p className="text-white/60 max-w-xl mx-auto mb-5 italic">"{SPEAKEASY_MASTER_SUITE.pitch}"</p>

            <div className="flex items-baseline justify-center gap-3 mb-6">
              <span className="text-4xl font-black text-white">${SPEAKEASY_MASTER_SUITE.price.toLocaleString()}</span>
              <span className="text-lg text-white/50">/mo</span>
              <span className="text-sm text-white/40 line-through">${SPEAKEASY_MASTER_SUITE.combined.toLocaleString()}</span>
            </div>

            <Button
              onClick={() => onSelect(SPEAKEASY_MASTER_SUITE)}
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
  );
}