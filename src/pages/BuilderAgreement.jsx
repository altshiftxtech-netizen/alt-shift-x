import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck, Lock, AlertTriangle, Eye, EyeOff, X, CheckCircle2 } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";

// ── Agreement Modal with scroll-gate ─────────────────────────────────────────
function AgreementModal({ onClose, onAccepted }) {
  const scrollRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (nearBottom) setScrolled(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-violet-600" />
            <h2 className="font-bold text-slate-900 text-base">Builder Agreement — Full Text</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        {/* Scroll notice */}
        {!scrolled && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-700 font-medium shrink-0">
            ↓ Scroll to the bottom to enable acceptance
          </div>
        )}

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-y-auto flex-1 px-6 py-5 text-sm text-slate-700 leading-relaxed space-y-5"
        >
          <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Alt+Shift+X Builder Agreement — Effective January 1, 2025</p>

          <div>
            <h3 className="font-bold text-slate-900 mb-2">1. User Data Sovereignty (Law 3) — Zero Persistence Rule</h3>
            <p>As a Builder, you are strictly bound by Ephemeral Processing. Documents processed through your component exist only in the runtime Knowledge State and must never leave it. You may not store, transmit, cache, log, or otherwise retain any portion of a user's documents or the resulting Knowledge State beyond the duration of the processing session.</p>
            <p className="mt-2">You are expressly prohibited from logging any data derived from user documents, even if anonymized or aggregated for "improvement" purposes.</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-2">2. X-Protocol Technical Compliance</h3>
            <p>All components must be built using the official X-Kit SDK and communicate via the X-Protocol. Components must not make external API calls unless explicitly certified. Output must conform exactly to the declared schema with no additional fields appended. Components must implement graceful degradation (Law 2) — returning an honest uncertainty signal rather than crashing or silently failing.</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-2">3. Certification & Adversarial Testing</h3>
            <p>Before achieving Certified (◇) or Official (◆) status, your component must pass a Privacy Audit (pass/fail), an Adversarial Stress Test (95%+ pass rate), and be subject to Continuous Trust Engine monitoring. The platform may automatically delist components whose safety score falls below acceptable thresholds.</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-2">4. Enforcement and Legal Penalties</h3>
            <p>Violations of the User Data Sovereignty Law are treated as material breaches of contract and result in: (a) Immediate Delisting with no appeal; (b) Forfeiture of all accrued and future revenue sharing from the delisted component; (c) Legal liability for any damages from unauthorized data retention or transmission; (d) Permanent ban from the Alt+Shift+X ecosystem for intentional violations.</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-2">5. Intellectual Property & Builder Rights (Law 6)</h3>
            <p>Builders retain full ownership of their components. Alt+Shift+X will never clone a successful community component to release an official alternative. Components reaching 5,000+ installs and a 95+ Trust Score are eligible for acquisition at fair market value (typically 24–36× monthly revenue).</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-2">6. Revenue Share & Payment Terms</h3>
            <p>Revenue share percentages are governed by your active Builder Subscription tier (Base Operator, Strategic Architect, or Sovereign Commander). Payouts are processed monthly via Stripe Connect. The platform reserves the right to adjust revenue share structures with 30 days' notice. Certification bonuses and volume rebates are applied as defined in the current Pricing schedule.</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-2">7. Component Moderation</h3>
            <p>The platform reserves the right to delist, suspend, or remove any component at its sole discretion if it violates platform policies, poses a risk to user data, or is determined to be deceptive in its described functionality. Builders will be notified of moderation actions with a reason provided.</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-2">8. Governing Law</h3>
            <p>This Agreement is governed by the laws of the State of Delaware, United States of America, without regard to conflict of law provisions. Any disputes arising under this Agreement shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.</p>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-4">
            <p className="text-xs font-bold text-violet-300 mb-1">IMPORTANT NOTICE</p>
            <p className="text-sm text-slate-300">By submitting a component for review, publishing to the marketplace, or activating a Builder Subscription, you confirm that you have read, understood, and agree to all terms of this Builder Agreement in their entirety.</p>
          </div>
        </div>

        {/* Acceptance footer */}
        <div className="px-6 py-4 border-t border-slate-200 shrink-0 space-y-3">
          <label className={`flex items-start gap-2 cursor-pointer ${!scrolled ? "opacity-40 pointer-events-none" : ""}`}>
            <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} className="mt-0.5" />
            <span className="text-sm text-slate-700">I have read the full Builder Agreement and agree to all terms and conditions.</span>
          </label>
          {!scrolled && <p className="text-xs text-slate-400 italic">Scroll to the bottom of the agreement to enable acceptance.</p>}
          <div className="flex gap-2">
            <Button variant="outline" className="text-sm flex-1" onClick={onClose}>Cancel</Button>
            <Button
              className="bg-violet-700 hover:bg-violet-800 text-white text-sm flex-1"
              disabled={!scrolled || !checked}
              onClick={() => { onAccepted(); onClose(); }}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" /> Accept Agreement
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Public Page ───────────────────────────────────────────────────────────────
export default function BuilderAgreement() {
  const [showModal, setShowModal] = useState(false);
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {showModal && (
        <AgreementModal
          onClose={() => setShowModal(false)}
          onAccepted={() => setAccepted(true)}
        />
      )}

      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-3 flex items-center gap-2">
        <Logo className="h-8 w-auto" />
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link to="/builder" className="text-sm text-slate-500 hover:text-slate-800">Builder Portal</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-sm text-slate-800 font-medium">Builder Agreement</span>
      </nav>

      {/* Header */}
      <div className="bg-slate-900 text-white py-12 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
          <ShieldCheck className="w-3.5 h-3.5" /> Data Sovereignty Protocol
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Builder Agreement</h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Legal and technical requirements for all Builders on the Alt+Shift+X marketplace.
        </p>
        <p className="text-xs text-slate-500 mt-4">Effective: January 1, 2025 — Last updated: May 2026</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">

        {/* Proprietary Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <Lock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900 mb-1">Proprietary & Confidential</h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              This agreement contains proprietary terms that are part of the Alt+Shift+X platform's intellectual property framework. The <strong>full agreement text is available only during the Builder onboarding and signup process</strong>. Below is a summary of the key obligations for informational purposes only.
            </p>
          </div>
        </div>

        {/* Summary sections */}
        <div className="space-y-4">
          {[
            { icon: ShieldCheck, color: "text-violet-600 bg-violet-50", title: "User Data Sovereignty (Law 3)", summary: "Zero-persistence processing. Documents must never be stored, transmitted, or logged beyond the active session. Violations result in immediate delisting." },
            { icon: AlertTriangle, color: "text-blue-600 bg-blue-50", title: "X-Protocol Technical Standards", summary: "All components must use the official SDK, operate locally, conform to declared output schemas, and implement graceful degradation." },
            { icon: Eye, color: "text-amber-600 bg-amber-50", title: "Certification & Adversarial Testing", summary: "Privacy audits, 95%+ adversarial test pass rate, and continuous Trust Engine monitoring required for certification." },
            { icon: AlertTriangle, color: "text-red-600 bg-red-50", title: "Enforcement & Legal Penalties", summary: "Material breach treatment: immediate delisting, revenue forfeiture, legal liability, and permanent platform ban for intentional violations." },
            { icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50", title: "Builder Rights (Law 6)", summary: "Builders own their IP. Platform will never clone community components. Acquisition path available at 5,000+ installs / 95+ Trust Score." },
          ].map(({ icon: Icon, color, title, summary }) => (
            <div key={title} className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color.split(" ")[1]}`}>
                <Icon className={`w-4 h-4 ${color.split(" ")[0]}`} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{summary}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Redaction notice */}
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-5 flex items-center gap-3">
          <EyeOff className="w-5 h-5 text-slate-400 shrink-0" />
          <p className="text-sm text-slate-500">
            Sections 6–12 (Revenue Share, Arbitration, Governing Law, and additional proprietary clauses) are available only within the secure signup flow to protect platform IP.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="font-bold text-slate-900 mb-2">Review & Accept the Full Agreement</h3>
          <p className="text-sm text-slate-500 mb-4">
            Click below to view the complete Builder Agreement. You must scroll through the full document and check the acceptance box to confirm your agreement.
          </p>
          {accepted ? (
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5" /> Agreement accepted — you may proceed to publish.
            </div>
          ) : (
            <Button className="bg-violet-700 hover:bg-violet-800 text-white gap-2" onClick={() => setShowModal(true)}>
              <Eye className="w-4 h-4" /> View Full Agreement
            </Button>
          )}
          <div className="flex flex-wrap gap-3 pt-4 mt-4 border-t border-slate-100">
            <Link to="/builder/publish" className="text-xs bg-slate-900 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
              Publish a Component →
            </Link>
            <Link to="/terms" className="text-xs text-violet-600 font-semibold hover:underline self-center">Terms of Service</Link>
            <Link to="/privacy" className="text-xs text-violet-600 font-semibold hover:underline self-center">Privacy Policy</Link>
            <Link to="/" className="text-xs text-slate-400 hover:underline self-center ml-auto">Back to Platform</Link>
          </div>
        </div>
      </div>
    </div>
  );
}