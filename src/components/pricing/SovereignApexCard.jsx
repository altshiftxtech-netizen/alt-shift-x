import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Zap, ShieldCheck, Crown, Loader2 } from "lucide-react";

const PRICING_UI_CODE = "SOVEREIGN-SUPER-PRICING-UI-1.0";

// Proprietary rule: surface only these two capability tooltips. Never expose
// the underlying boolean logic / routing internals in the UI.
const CAPABILITY_TOOLTIPS = [
  { icon: Zap, label: "Deterministic Speed", hint: "Same fast path, every request — predictable, benchmarked latency." },
  { icon: ShieldCheck, label: "Forensic Integrity", hint: "Every output is bit-stamped and verifiable under GSP-Master-Canon." },
];

const TIER_META = {
  developer: { name: "Developer", accent: "#8B5CF6", blurb: "Free account — pay per component, bundle up to the ExpertMinds stack." },
  builder: { name: "Builder", accent: "#0EA5E9", blurb: "Full builder suite with the ExpertMinds bundle upgrade." },
  expertminds: { name: "ExpertMinds", accent: "#C8A95B", blurb: "The Gen-2 Orchestrator — sovereign enterprise intelligence." },
};

const money = (n) => `$${Number(n).toLocaleString()}`;

/**
 * SovereignApexCard — reads the live SOVEREIGN-SUPER-PRICING-UI-1.0 record and
 * renders its tier/bundle matrix. The record's `features[0]` holds the source-of-
 * truth JSON matrix ({ tiers, protection, ui_component }).
 */
export default function SovereignApexCard() {
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.Component.filter({ code: PRICING_UI_CODE, status: "published" });
        const rec = rows[0];
        if (rec?.features?.[0]) {
          const parsed = JSON.parse(rec.features[0]);
          if (!cancelled) setMatrix(parsed);
        }
      } catch {
        /* leave matrix null — section hides itself */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 pb-16 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-[#C8A95B]/60" />
      </div>
    );
  }

  if (!matrix?.tiers) return null;

  const order = ["developer", "builder", "expertminds"];
  const tiers = order.filter((k) => matrix.tiers[k]);

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20">
      <div className="rounded-3xl border border-[#C8A95B]/30 bg-gradient-to-br from-[#12100b] via-[#0d0b08] to-black p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#E6C878]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C8A95B]">Sovereign Bundle Matrix</p>
              <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>ExpertMinds Bundle Pricing</h3>
            </div>
          </div>
          {matrix.protection && (
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-[#E6C878]" style={{ background: "rgba(200,169,91,0.12)", border: "1px solid rgba(200,169,91,0.35)" }}>
              <ShieldCheck className="w-3.5 h-3.5" /> {matrix.protection.replace(/-/g, " ")}
            </span>
          )}
        </div>

        {/* Capability tooltips — only the two permitted labels */}
        <div className="flex flex-wrap gap-3 mb-8">
          {CAPABILITY_TOOLTIPS.map(({ icon: Icon, label, hint }) => (
            <div key={label} title={hint} className="group inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 cursor-help">
              <Icon className="w-3.5 h-3.5 text-[#E6C878]" />
              <span className="text-xs font-semibold text-[#E8DFC8]">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((key) => {
            const t = matrix.tiers[key];
            const meta = TIER_META[key] || { name: key, accent: "#C8A95B", blurb: "" };
            const isApex = key === "expertminds";
            return (
              <div
                key={key}
                className="relative rounded-2xl p-5 flex flex-col"
                style={{
                  background: isApex ? "linear-gradient(160deg, rgba(200,169,91,0.14), rgba(0,0,0,0.4))" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isApex ? "rgba(200,169,91,0.5)" : "rgba(255,255,255,0.1)"}`,
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: meta.accent }}>{meta.name}</p>
                <p className="text-xs text-white/50 mb-4 min-h-[2.5rem]">{meta.blurb}</p>

                <div className="mb-1">
                  <span className="text-3xl font-black text-white">{money(t.base)}</span>
                  <span className="text-xs text-white/40"> /mo base</span>
                </div>

                {t.em_bundle != null ? (
                  <div className="mt-3 rounded-lg px-3 py-2" style={{ background: "rgba(200,169,91,0.1)", border: "1px solid rgba(200,169,91,0.3)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#C8A95B]">+ ExpertMinds Bundle</p>
                    <p className="text-lg font-black text-[#E6C878]">{money(t.em_bundle)}<span className="text-xs font-normal text-white/40"> /mo</span></p>
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg px-3 py-2" style={{ background: "rgba(200,169,91,0.1)", border: "1px solid rgba(200,169,91,0.3)" }}>
                    <p className="text-[11px] font-semibold text-[#E6C878]">Includes full ExpertMinds orchestration</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}