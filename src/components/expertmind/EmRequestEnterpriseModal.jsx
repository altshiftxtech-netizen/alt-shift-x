import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Building2, ShieldCheck, Crown, Loader2, ArrowRight, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { EM } from "./emTokens";

const EM_LOGO = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/b0a6e86d1_Copilot_20260705_193928.png";

/**
 * EmRequestEnterpriseModal — the "Request Enterprise Access" pop-up for the
 * ExpertMinds landing page. Marketed separately from the Sovereign tier.
 *
 * Flow on "Continue":
 *  - Authorized (admin or active enterprise subscription) → /enterprise landing page.
 *  - Not authorized (guest or free-tier)                  → dedicated ExpertMinds
 *    Enterprise paywall view inside this modal.
 */
export default function EmRequestEnterpriseModal({ open, onClose }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [gated, setGated] = useState(false);

  if (!open) return null;

  const inIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();

  const onContinue = async () => {
    setChecking(true);
    try {
      const user = await base44.auth.me();
      if (user?.role === "admin") { navigate("/enterprise"); return; }
      const subs = await base44.entities.Subscription.filter({ user_id: user.id });
      const sub = subs[0];
      const authorized = sub && sub.plan === "enterprise" && ["active", "trialing", "past_due"].includes(sub.status);
      if (authorized) { navigate("/enterprise"); } else { setGated(true); }
    } catch {
      setGated(true);
    } finally {
      setChecking(false);
    }
  };

  const subscribe = async () => {
    if (inIframe) {
      alert("Checkout works only from the published app. Open ExpertMinds in a new tab to subscribe.");
      return;
    }
    setChecking(true);
    try {
      const res = await base44.functions.invoke("createSovereignCheckout", {});
      if (res.data?.url) { window.location.href = res.data.url; return; }
    } catch { /* fall through to login */ }
    // Guests / not logged in — send to login so they can subscribe.
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" style={{ background: "rgba(8,10,16,0.75)" }} onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#fff", border: `1px solid ${EM.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 z-10"><X className="w-5 h-5" /></button>

        {/* Header */}
        <div className="px-7 pt-8 pb-6 text-center" style={{ background: `linear-gradient(135deg, ${EM.primary}, ${EM.accent})` }}>
          <img src={EM_LOGO} alt="ExpertMinds" className="h-14 w-auto object-contain mx-auto mb-3" draggable="false" />
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/70">ExpertMinds Enterprise</p>
          <h3 className="text-xl font-bold text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            {gated ? "Enterprise Access Required" : "Request Enterprise Access"}
          </h3>
        </div>

        {!gated ? (
          <div className="px-7 py-6">
            <p className="text-sm text-slate-500 text-center mb-5">
              The organizational tier for governed knowledge capture — member seats, forensic verification, and the
              full ExpertMinds Enterprise command center.
            </p>
            <ul className="space-y-2.5 mb-6">
              {[
                { icon: Building2, text: "Organization-wide knowledge governance" },
                { icon: Crown, text: "Provisioned member seats & staff registry" },
                { icon: ShieldCheck, text: "Vana-Voice forensic verification" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: EM.accent }} /> {text}
                </li>
              ))}
            </ul>
            <button
              onClick={onContinue}
              disabled={checking}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 transition-transform hover:-translate-y-px"
              style={{ background: `linear-gradient(135deg, ${EM.primary}, ${EM.accent})` }}
            >
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        ) : (
          <div className="px-7 py-6 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: EM.accentSoft }}>
              <Lock className="w-6 h-6" style={{ color: EM.accent }} />
            </div>
            <p className="text-sm text-slate-500 mb-1">
              ExpertMinds Enterprise is an authorized, subscription-gated tier.
            </p>
            <p className="text-3xl font-black text-slate-900 mt-3">$2,499<span className="text-base font-semibold text-slate-400">/mo</span></p>
            <p className="text-[12px] text-slate-400 mb-5">Enterprise Intelligence subscription</p>
            <button
              onClick={subscribe}
              disabled={checking}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 transition-transform hover:-translate-y-px"
              style={{ background: `linear-gradient(135deg, ${EM.primary}, ${EM.accent})` }}
            >
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Subscribe to Enterprise <ArrowRight className="w-4 h-4" /></>}
            </button>
            <button onClick={() => setGated(false)} className="mt-3 text-xs text-slate-400 hover:text-slate-600">Back</button>
          </div>
        )}
      </div>
    </div>
  );
}