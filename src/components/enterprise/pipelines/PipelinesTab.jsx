import React, { useState } from "react";
import { Sparkles, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import EnterprisePipelineCard from "@/components/enterprise/pipelines/EnterprisePipelineCard";
import { ENTERPRISE_PIPELINES, ENTERPRISE_MASTER_SUITE } from "@/components/enterprise/pipelines/enterprisePipelines";

const GOLD = "#E6C878";

/**
 * PipelinesTab — the Sovereign Exclusive Pipelines rendered inline on the
 * Enterprise landing page (no route change). Loosely gated: any paying
 * subscriber may browse. Non-paying users see a soft lock with a pricing CTA.
 */
export default function PipelinesTab({ canPipelines }) {
  const [selected, setSelected] = useState(null);

  if (!canPipelines) {
    return (
      <div className="max-w-lg mx-auto text-center rounded-2xl border p-10" style={{ borderColor: `${GOLD}33`, background: "rgba(255,255,255,0.03)" }}>
        <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: `${GOLD}1a`, border: `1px solid ${GOLD}44` }}>
          <Lock className="w-6 h-6" style={{ color: GOLD }} />
        </div>
        <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Exclusive Pipelines</h3>
        <p className="text-sm text-white/50 mb-5">Any paid subscription unlocks the Gen-2 Sovereign Seven and the Master Suite. Upgrade to browse and license them.</p>
        <a href="/pricing"><Button className="font-bold text-[#0A0A0C]" style={{ background: `linear-gradient(90deg,#E6C878,#C8A95B)` }}>View plans</Button></a>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-3" style={{ background: `${GOLD}1a`, border: `1px solid ${GOLD}44`, color: GOLD }}>
          <Sparkles className="w-3.5 h-3.5" /> Sovereign Exclusive Pipelines
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>The Gen-2 Sovereign Seven</h2>
        <p className="text-white/60 max-w-2xl mx-auto leading-relaxed text-sm">
          The highest-tier pipelines on the platform — built on the "Expertminds" lineage, set up and tuned by Bob. Each licensed behind a single secure key.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {ENTERPRISE_PIPELINES.map((p) => (
          <EnterprisePipelineCard key={p.key} pipeline={p} onSelect={setSelected} />
        ))}
      </div>

      {/* Master Suite bundle */}
      <div className="relative rounded-2xl p-8 md:p-10 overflow-hidden text-center" style={{ border: `2px solid ${GOLD}`, background: "linear-gradient(180deg, rgba(19,24,36,0.6) 0%, rgba(10,10,12,0.75) 100%)", boxShadow: `0 0 60px ${GOLD}33` }}>
        <span className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: `${GOLD}22` }} />
        <div className="relative z-10">
          <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: `${GOLD}1a`, border: `1px solid ${GOLD}55` }}>
            <Crown className="w-7 h-7" style={{ color: GOLD }} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: GOLD }}>Best Value · Save 10%</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{ENTERPRISE_MASTER_SUITE.name}</h2>
          <p className="text-white/60 max-w-xl mx-auto mb-5 italic">"{ENTERPRISE_MASTER_SUITE.pitch}"</p>
          <div className="flex items-baseline justify-center gap-3 mb-6">
            <span className="text-4xl font-black text-white">${ENTERPRISE_MASTER_SUITE.price.toLocaleString()}</span>
            <span className="text-lg text-white/50">/mo</span>
            <span className="text-sm text-white/40 line-through">${ENTERPRISE_MASTER_SUITE.combined.toLocaleString()}</span>
          </div>
          <Button onClick={() => setSelected(ENTERPRISE_MASTER_SUITE)} className="font-bold px-8 hover:opacity-90" style={{ background: `linear-gradient(90deg, #D9DCE1, ${GOLD})`, color: "#0A0A0C" }}>
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
  );
}