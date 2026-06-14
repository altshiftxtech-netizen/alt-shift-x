import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, Lock } from "lucide-react";
import SpotlightShareButton from "@/components/marketplace/SpotlightShareButton";
import RatingDisplay from "@/components/RatingDisplay";

/**
 * FeaturedSpotlight — a pinned hero strip for components flagged `featured`.
 * Rendered at the very top of the marketplace, above the Enterprise Pipelines
 * promo, so spotlighted protection components (e.g. SAFEGUARD-1.0) lead the page.
 */
export default function FeaturedSpotlight({ components = [], userId, installedMap = {}, isAuthenticated, onUninstalled }) {
  if (!components.length) return null;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4">
      {components.map((c) => (
        <Link
          key={c.id}
          to={`/marketplace/${c.id}`}
          className="group relative rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-900/50 via-slate-900/70 to-black/70 backdrop-blur-md p-5 ring-1 ring-emerald-400/20 shadow-xl hover:border-emerald-400/70 transition-colors"
        >
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Featured Protection
            </span>
            {c.requires_legal_acceptance && (
              <span className="text-[9px] font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Legal gating
              </span>
            )}
            {c.certified && (
              <span className="text-[9px] font-semibold text-emerald-200 bg-emerald-800/60 px-1.5 py-0.5 rounded-full">Certified</span>
            )}
          </div>

          <h2 className="text-2xl font-extrabold text-white mb-1 group-hover:text-emerald-200 transition-colors">
            {c.name}
          </h2>
          <p className="text-[11px] font-mono text-white/40 mb-3">{c.code}</p>
          <p className="text-sm text-white/70 leading-relaxed line-clamp-3 mb-4">{c.description}</p>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
             <div className="flex items-center gap-3">
               <RatingDisplay rating={c.rating || 0} reviewsCount={c.reviews_count || 0} className="!text-amber-300 !bg-transparent !px-0" />
               {(c.trust_score || 0) > 0 && (
                 <span className="flex items-center gap-1 text-xs text-emerald-300">
                   <ShieldCheck className="w-3.5 h-3.5" /> {c.trust_score} Trust
                 </span>
               )}
             </div>
            <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-300 group-hover:translate-x-0.5 transition-transform">
              View details <ArrowRight className="w-4 h-4" />
            </span>
          </div>

          {/* Affiliate share + gated CTA — payment only via the detail page legal walkthrough */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10" onClick={(e) => e.preventDefault()}>
            <SpotlightShareButton component={c} />
            {c.requires_legal_acceptance && (
              <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-amber-300/80">
                <Lock className="w-3 h-3" /> Disclaimer required before purchase
              </span>
            )}
            <Link
              to={`/marketplace/${c.id}`}
              className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Review &amp; Install <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Link>
      ))}
    </div>
  );
}