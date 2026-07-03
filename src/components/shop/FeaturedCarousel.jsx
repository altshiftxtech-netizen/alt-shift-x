import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ExternalLink } from "lucide-react";

// Featured exclusive-deals carousel for the shop homepage. One big split card
// at a time with prev/next + dots.
export default function FeaturedCarousel({ products }) {
  const [idx, setIdx] = useState(0);
  if (!products || products.length === 0) return null;
  const p = products[idx % products.length];
  const go = (d) => setIdx((i) => (i + d + products.length) % products.length);
  const openDeal = () => {
    if (p.affiliate_url) window.open(p.affiliate_url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative">
      <div className="grid sm:grid-cols-2 rounded-3xl overflow-hidden border border-slate-200 bg-white min-h-[240px]">
        <div className="bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6 min-h-[180px]">
          {p.image_url ? (
            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <div className="text-5xl font-bold text-slate-300">{p.name?.[0]}</div>
          )}
        </div>
        <div className="p-6 sm:p-8 flex flex-col justify-center text-white"
          style={{ background: "linear-gradient(135deg,#1A1A2E,#0066FF)" }}>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-3 self-start px-2 py-1 rounded-full bg-white/15">
            <Sparkles className="w-3 h-3" /> Featured Deal
          </span>
          <h3 className="text-2xl font-bold">{p.exclusive_deal || p.name}</h3>
          <p className="text-white/70 mt-1">{p.name}{p.price_label ? ` · ${p.price_label}` : ""}</p>
          {p.short_description && <p className="text-white/60 text-sm mt-2">{p.short_description}</p>}
          <button onClick={openDeal} disabled={!p.affiliate_url}
            className="mt-5 inline-flex items-center justify-center gap-1.5 self-start rounded-xl px-5 py-2.5 text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 disabled:opacity-50">
            {p.affiliate_url ? <>Get Deal <ExternalLink className="w-4 h-4" /></> : "Coming Soon"}
          </button>
        </div>
      </div>

      {products.length > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="Previous"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-slate-200 shadow flex items-center justify-center hover:bg-white">
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
          <button onClick={() => go(1)} aria-label="Next"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-slate-200 shadow flex items-center justify-center hover:bg-white">
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>
          <div className="flex justify-center gap-1.5 mt-4">
            {products.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === idx % products.length ? "w-6 bg-[#0066FF]" : "w-1.5 bg-slate-300"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}