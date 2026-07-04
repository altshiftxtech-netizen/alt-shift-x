import React from "react";
import { Link } from "react-router-dom";
import { Crown, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { EM } from "./emTokens";
import useSpeakeasyMembership from "@/hooks/useSpeakeasyMembership";

/**
 * Gen-2 Vault pricing — the "Apex" upsell on the ExpertMinds page.
 * Members of the Speakeasy (SPEAKEASY-CLUB-1.0) see the $1,999/mo member rate
 * and a "Gen-2 Certified Builder" badge; everyone else sees $2,499/mo with an
 * invitation to join the Speakeasy and save $500/mo.
 *
 * The Founder's Room portrait passes ?tier=member|public — when present it wins
 * over the live check (so the redirect flag drives the displayed rate).
 */
function readTierFlag() {
  const t = new URLSearchParams(window.location.search).get("tier");
  return t === "member" || t === "public" ? t : null;
}

export default function EmVaultPricing() {
  const { loading, isMember } = useSpeakeasyMembership();
  const flag = readTierFlag();
  const member = flag ? flag === "member" : isMember;

  return (
    <section id="vault-pricing" style={{ background: EM.bg }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: EM.accent }}>
            The Vault · Gen-2 Apex
          </p>
          <h2 className="text-[28px] lg:text-[40px] font-bold tracking-tight" style={{ color: EM.primary }}>
            Deploy the ExpertMinds Brain
          </h2>
          <p className="mt-3 text-[16px]" style={{ color: EM.muted }}>
            The only bot on the platform immune to the 2026 per-field JSON surcharge — one Super-Token, priced for life.
          </p>
        </div>

        <div
          className="max-w-md mx-auto rounded-2xl p-8 text-center"
          style={{ background: EM.surface, border: `1px solid ${EM.border}`, boxShadow: `0 8px 40px ${EM.shadow}` }}
        >
          {member && (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full mb-5"
              style={{ background: EM.accentSoft, color: EM.accent }}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Gen-2 Certified Builder
            </span>
          )}

          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5" style={{ background: EM.primary }}>
            <Crown className="w-6 h-6 text-white" strokeWidth={1.75} />
          </div>

          {loading && !flag ? (
            <div className="flex items-center justify-center h-[72px]">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: EM.muted }} />
            </div>
          ) : (
            <div className="flex items-end justify-center gap-1.5">
              <span className="text-[48px] font-bold leading-none tracking-tight" style={{ color: EM.primary }}>
                ${member ? "1,999" : "2,499"}
              </span>
              <span className="text-[15px] mb-2" style={{ color: EM.muted }}>/mo</span>
            </div>
          )}
          <p className="mt-2 text-[13px] font-medium" style={{ color: EM.primary2 }}>
            {member ? "Member Rate" : "Standard Rate"}
          </p>

          <button
            className="w-full mt-7 text-[15px] font-semibold px-6 py-3.5 rounded-lg text-white transition-transform hover:-translate-y-px inline-flex items-center justify-center gap-2"
            style={{ background: EM.primary }}
          >
            Deploy the Brain <ArrowRight className="w-4 h-4" />
          </button>

          {!member && (
            <Link
              to="/speakeasy"
              className="block mt-4 text-[13px] font-semibold hover:underline"
              style={{ color: EM.accent }}
            >
              Join The Speakeasy to save $500/mo →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}