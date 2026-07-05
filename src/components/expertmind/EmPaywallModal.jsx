import React from "react";
import { Link } from "react-router-dom";
import { X, Lock, Crown, ArrowRight, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { EM } from "./emTokens";

/**
 * Paywall shown when a non-paying visitor (guest or free tier) tries to launch
 * the ExpertMind extraction console. The landing page itself stays public; this
 * gate only protects the paid tool. Members/admins never see this — the launch
 * opens the console directly.
 */
export default function EmPaywallModal({ open, isGuest, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: EM.surface, border: `1px solid ${EM.border}`, boxShadow: `0 8px 40px ${EM.shadow}` }}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: EM.primary }}>
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4" style={{ color: EM.accentSoft }} />
            <p className="text-[11px] uppercase tracking-[0.16em] text-white font-semibold">Members Only</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-7 py-8 text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5" style={{ background: EM.primary }}>
            <Crown className="w-6 h-6 text-white" strokeWidth={1.75} />
          </div>
          <h3 className="text-[20px] font-bold tracking-tight" style={{ color: EM.primary }}>
            Unlock the Extraction Console
          </h3>
          <p className="mt-3 text-[14px] leading-relaxed" style={{ color: EM.muted }}>
            {isGuest
              ? "The live ExpertMind™ console is a members-only tool. Sign in with a paying membership, or view pricing to get access."
              : "The live ExpertMind™ console is reserved for paying members. Upgrade your plan to deploy the brain and run structured extractions."}
          </p>

          <Link to="/pricing" onClick={onClose}>
            <button
              className="w-full mt-6 text-[15px] font-semibold px-6 py-3.5 rounded-lg text-white transition-transform hover:-translate-y-px inline-flex items-center justify-center gap-2"
              style={{ background: EM.primary }}
            >
              View Pricing <ArrowRight className="w-4 h-4" />
            </button>
          </Link>

          {isGuest ? (
            <button
              onClick={() => base44.auth.redirectToLogin(window.location.pathname + window.location.search)}
              className="block w-full mt-3 text-[13px] font-semibold hover:underline"
              style={{ color: EM.accent }}
            >
              Already a member? Sign in →
            </button>
          ) : (
            <a href="#vault-pricing" onClick={onClose} className="block mt-3 text-[13px] font-semibold hover:underline" style={{ color: EM.accent }}>
              <Sparkles className="inline w-3.5 h-3.5 mr-1" /> See the Vault rate
            </a>
          )}
        </div>
      </div>
    </div>
  );
}