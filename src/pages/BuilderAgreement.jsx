import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight, ShieldCheck, Lock, AlertTriangle, Eye, EyeOff, X,
  CheckCircle2, DollarSign, FileWarning, BadgeCheck, Flame, ArrowRight,
  Star, Shield, Zap, Info
} from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import DowngradeDataPolicy from "@/components/builder-agreement/DowngradeDataPolicy";

// ─── Policy tier definitions ───────────────────────────────────────────────
const POLICY_TIERS = [
  {
    id: "standard",
    label: "Standard Builder",
    badge: "Standard",
    badgeColor: "bg-slate-700 text-slate-300 border-slate-600",
    headerColor: "from-slate-800 to-slate-900",
    accentColor: "text-slate-300",
    borderColor: "border-slate-700",
    icon: Shield,
    tagline: "20% escrow holdback · Full clawback exposure · Standard Trust Engine monitoring",
    description: "The default policy for all builders on the platform. A 20% rolling escrow protects buyers, with clawback rights on TMT-3 audit failures.",
    escrowPct: 20,
    escrowDays: 7,
    clawbackExposure: "Full",
    pricePreemium: "None",
    insuredRequired: false,
  },
  {
    id: "insured",
    label: "Insured Builder",
    badge: "Safe Harbor",
    badgeColor: "bg-emerald-900 text-emerald-300 border-emerald-700",
    headerColor: "from-emerald-900 to-slate-900",
    accentColor: "text-emerald-300",
    borderColor: "border-emerald-700",
    icon: BadgeCheck,
    tagline: "5% escrow · Clawback indemnity via E&O insurance · Enterprise filter visibility",
    description: "For builders who carry a minimum of $1M E&O (Errors & Omissions) coverage. The insurance covers clawback events, reducing your escrow holdback to 5% and unlocking the 'Insured Components Only' enterprise filter.",
    escrowPct: 5,
    escrowDays: 7,
    clawbackExposure: "Insured (E&O covers platform losses)",
    pricePreemium: "+5% Innovation Royalty on revenue share",
    insuredRequired: true,
  },
  {
    id: "verified",
    label: "TMT-3 Verified Builder",
    badge: "Verified ◆",
    badgeColor: "bg-violet-900 text-violet-300 border-violet-600",
    headerColor: "from-violet-900 to-slate-900",
    accentColor: "text-violet-300",
    borderColor: "border-violet-600",
    icon: Star,
    tagline: "TMT-3 Sentinel Audit passed · 15% price premium · Reduced escrow · Verified badge",
    description: "Components that pass the rigorous TMT-3 Sentinel Truth Audit receive the Verified ◆ badge, a 15% marketplace price premium, and the lowest escrow requirement. Adversarial testing proves graceful failure over hallucination.",
    escrowPct: 10,
    escrowDays: 7,
    clawbackExposure: "Reduced (post-audit indemnity period)",
    pricePreemium: "+15% price premium in marketplace",
    insuredRequired: false,
  },
];

const INTEGRITY_GATES = [
  { gate: "Metric Fraud", freq: "Continuous (Real-time)", action: "Immediate delisting; 12-month ban on new submissions.", severity: "critical" },
  { gate: "Accuracy Drift", freq: "Weekly (Batch)", action: '"Warning" badge applied; 30-day window to retrain/update.', severity: "warning" },
  { gate: "Hallucination Spike", freq: "Per Query (Threshold)", action: "Automatic fallback to YottaJoule 380; notification to buyer.", severity: "info" },
];

const DELISTING_STEPS = [
  { n: 1, label: "De-platforming", detail: "Component delisted from marketplace search and storefronts." },
  { n: 2, label: "Notification", detail: "Existing subscribers notified of quality drop." },
  { n: 3, label: "Auto-Migration", detail: 'Users offered free 30-day "Bridge Migration" to next highest-rated alternative in category.' },
];

// ─── Agreement Modal ────────────────────────────────────────────────────────
export function AgreementModal({ onClose, onAccepted }) {
  const scrollRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [checked, setChecked] = useState(false);
  const [selectedTier, setSelectedTier] = useState("standard");

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) setScrolled(true);
  };

  const tier = POLICY_TIERS.find(t => t.id === selectedTier);
  const TierIcon = tier.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0 bg-slate-900 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-violet-400" />
            <h2 className="font-bold text-white text-base">Builder Agreement & Escrow Policy</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {!scrolled && (
          <div className="bg-amber-900/30 border-b border-amber-700/40 px-6 py-2 text-xs text-amber-300 font-medium shrink-0">
            ↓ Scroll to the bottom to enable acceptance
          </div>
        )}

        <div ref={scrollRef} onScroll={handleScroll} className="overflow-y-auto flex-1 px-6 py-5 text-sm text-slate-300 leading-relaxed space-y-6">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Alt+Shift+X Builder Agreement — Component Integrity & Escrow Policy — Effective January 1, 2025</p>

          {/* Tier selector inside modal */}
          <div>
            <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wide">Select Your Policy Tier</p>
            <div className="grid grid-cols-3 gap-2">
              {POLICY_TIERS.map(t => {
                const TIcon = t.icon;
                return (
                  <button key={t.id} onClick={() => setSelectedTier(t.id)}
                    className={`border rounded-xl p-3 text-left transition-all ${selectedTier === t.id ? t.borderColor + " bg-slate-800/80" : "border-slate-700 bg-slate-900/50 hover:border-slate-500"}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <TIcon className={`w-3.5 h-3.5 ${selectedTier === t.id ? t.accentColor : "text-slate-500"}`} />
                      <span className={`text-xs font-bold ${selectedTier === t.id ? t.accentColor : "text-slate-400"}`}>{t.label}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-bold ${t.badgeColor}`}>{t.badge}</span>
                  </button>
                );
              })}
            </div>
            {/* Active tier summary */}
            <div className={`mt-3 border rounded-xl p-4 bg-slate-900/60 ${tier.borderColor}`}>
              <p className={`text-xs font-semibold mb-1 ${tier.accentColor}`}>{tier.tagline}</p>
              <p className="text-xs text-slate-400">{tier.description}</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {[
                  ["Escrow Holdback", `${tier.escrowPct}% · ${tier.escrowDays}-day rolling`],
                  ["Clawback Exposure", tier.clawbackExposure],
                  ["Price Premium", tier.pricePreemium],
                  ["Insurance Required", tier.insuredRequired ? "Yes — Min. $1M E&O" : "No"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-slate-800/60 rounded-lg p-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">{k}</p>
                    <p className="text-xs text-white font-semibold mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Standard agreement sections */}
          <div>
            <h3 className="font-bold text-white mb-2">1. The Escrow Protocol ("The Safety Catch")</h3>
            <p>To protect institutional buyers from capability drift or performance degradation, a portion of component revenue is held in a rolling escrow before payout eligibility.</p>
            <ul className="mt-2 space-y-1.5 list-disc list-inside text-slate-400 text-xs">
              <li><strong className="text-slate-300">The Holdback:</strong> Standard builders: 20% held for 7 days. Insured builders (min. $1M E&O): 5%. TMT-3 Verified builders: 10%.</li>
              <li><strong className="text-slate-300">The Performance Trigger:</strong> If Trust Score falls below 70 during escrow, funds are held until a remediation plan is approved by the Certification Queue.</li>
              <li><strong className="text-slate-300">The Clawback Clause:</strong> Failure of adversarial stress test or TMT-3 Sentinel Truth Audit post-purchase grants the platform the right to refund the most recent month's subscription to all affected users, debited from escrowed funds.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-2">2. The Integrity Gates (Automated Governance)</h3>
            <p className="mb-3">The Trust Engine performs continuous, unannounced "Shadow Audits" to verify components meet their stated metrics.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 pr-3 text-slate-400 font-semibold">Gate Level</th>
                    <th className="text-left py-2 pr-3 text-slate-400 font-semibold">Frequency</th>
                    <th className="text-left py-2 text-slate-400 font-semibold">Action on Failure</th>
                  </tr>
                </thead>
                <tbody>
                  {INTEGRITY_GATES.map(g => (
                    <tr key={g.gate} className="border-b border-slate-800">
                      <td className={`py-2 pr-3 font-semibold ${g.severity === "critical" ? "text-red-400" : g.severity === "warning" ? "text-amber-400" : "text-blue-400"}`}>{g.gate}</td>
                      <td className="py-2 pr-3 text-slate-400">{g.freq}</td>
                      <td className="py-2 text-slate-400">{g.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-2">3. The TMT-3 Sentinel Audit</h3>
            <p>The TMT-3 Sentinel Truth Audit is the gold standard for platform integrity. Components that pass receive a <strong className="text-violet-400">Verified ◆ badge</strong> and a 15% price premium in the marketplace.</p>
            <ul className="mt-2 space-y-1.5 list-disc list-inside text-slate-400 text-xs">
              <li><strong className="text-slate-300">Adversarial Resilience:</strong> Tested against documents with intentional contradictions and misleading formatting.</li>
              <li><strong className="text-slate-300">Graceful Failure:</strong> Must return an "Honest Uncertainty" signal rather than a confident hallucination.</li>
              <li><strong className="text-slate-300">Ethical Guardrails:</strong> All logic must adhere to the Conscience Ethics Matrix to prevent anti-policy behavior.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-2">4. The Delisting & Migration Flow</h3>
            <p className="mb-3">If a component falls below a Trust Score of 50 for 30 consecutive days:</p>
            <div className="space-y-2">
              {DELISTING_STEPS.map(s => (
                <div key={s.n} className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-3">
                  <div className="w-6 h-6 bg-red-900 border border-red-700 rounded-full flex items-center justify-center text-[10px] font-bold text-red-300 shrink-0">{s.n}</div>
                  <div><p className="text-xs font-semibold text-white">{s.label}</p><p className="text-xs text-slate-400">{s.detail}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-2">5. Insurance as Safe Harbor — E&O / General Liability</h3>
            <p className="mb-2">Builders who provide verified proof of E&O (Errors & Omissions) insurance with a minimum of <strong className="text-white">$1M in coverage</strong> are granted Safe Harbor status with the following benefits:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { label: "Escrow Waiver", detail: "Holdback reduced from 20% to 5% — improving immediate cash flow." },
                { label: "Clawback Indemnity", detail: "Builder's insurance covers the platform's losses in the event of a mass refund post TMT-3 failure." },
                { label: "Innovation Royalty Boost", detail: "+5% higher revenue share modifier within your 70% builder share." },
                { label: "Enterprise Filter", detail: '"Insured Components Only" filter in Marketplace — direct visibility increase to enterprise buyers.' },
                { label: "Credential Vault", detail: "Upload and maintain active ACORD certificates in your Builder Profile. Alerts fire 30 days before expiry." },
                { label: "Expiry Penalty", detail: "Failure to renew insurance on time triggers an automatic Trust Score penalty until compliance is restored." },
              ].map(item => (
                <div key={item.label} className="bg-emerald-900/20 border border-emerald-800/40 rounded-lg p-2.5">
                  <p className="font-semibold text-emerald-300">{item.label}</p>
                  <p className="text-slate-400 mt-0.5">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-2">6. User Data Sovereignty (Law 3) — Zero Persistence Rule</h3>
            <p>Documents processed through your component exist only in the runtime Knowledge State and must never leave it. You may not store, transmit, cache, log, or otherwise retain any portion of a user's documents beyond the duration of the processing session.</p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-2">7. X-Protocol Technical Compliance</h3>
            <p>All components must use the official X-Kit SDK, communicate via the X-Protocol, implement graceful degradation (Law 2), and conform exactly to the declared output schema.</p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-2">8. Intellectual Property & Builder Rights (Law 6)</h3>
            <p>Builders retain full ownership of their components. Alt+Shift+X will never clone a successful community component. Components reaching 5,000+ installs and a 95+ Trust Score are eligible for acquisition at 24–36× monthly revenue.</p>
          </div>

          <div className="bg-violet-900/15 border border-violet-700/40 rounded-xl p-4">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-violet-400" /> 8a. IP & Proprietary Information Masking Clause</h3>
            <p className="mb-2">Any intellectual property, trade secrets, or proprietary information that appears in content processed by your component — whether belonging to you, the platform, or an end user — is <strong className="text-white">automatically masked, redacted, or tokenized</strong> in any statement, report, or output the platform generates (including pairing statements, compliance statements, and audit records).</p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400 text-xs">
              <li><strong className="text-slate-300">Applies to every user:</strong> This masking scheme is enforced for all users, including free and non-paying accounts. It is never gated behind a paid plan.</li>
              <li><strong className="text-slate-300">No raw exposure:</strong> Raw proprietary values are never surfaced in shared statements; original values remain only inside the private runtime session and are then discarded under the Zero-Persistence Rule (§6).</li>
              <li><strong className="text-slate-300">Consistent practice:</strong> All statements made by or through the platform follow these established protection practices so that sensitive IP and proprietary information is masked by default.</li>
            </ul>
            <p className="mt-2 text-xs text-slate-500">By accepting this Agreement you acknowledge and rely on the fact that IP and proprietary information is masked in all platform-generated statements, consistent with our standing protection practices.</p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-2">9. Governing Law</h3>
            <p>This Agreement is governed by the laws of the State of Delaware, USA. Disputes resolved through binding arbitration per American Arbitration Association rules.</p>
          </div>

          <div className="bg-slate-800 border border-violet-700/40 rounded-xl p-4">
            <p className="text-xs font-bold text-violet-300 mb-1">IMPORTANT NOTICE</p>
            <p className="text-sm text-slate-300">By submitting, publishing, or activating a Builder Subscription, you confirm you have read, understood, and agree to all terms including the Component Integrity & Escrow Policy, and you acknowledge your selected policy tier.</p>
          </div>
        </div>

        {/* Acceptance footer */}
        <div className="px-6 py-4 border-t border-slate-700 shrink-0 space-y-3 bg-slate-900 rounded-b-2xl">
          <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg border inline-flex items-center gap-1.5 ${tier.badgeColor}`}>
            <TierIcon className="w-3.5 h-3.5" /> Selected: {tier.label} — {tier.escrowPct}% Escrow
          </div>
          <label className={`flex items-start gap-2 cursor-pointer ${!scrolled ? "opacity-40 pointer-events-none" : ""}`}>
            <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} className="mt-0.5" />
            <span className="text-sm text-slate-300">I have read the full Builder Agreement & Component Integrity Policy and agree to all terms under the <strong className="text-white">{tier.label}</strong> policy tier.</span>
          </label>
          {!scrolled && <p className="text-xs text-slate-500 italic">Scroll to the bottom to enable acceptance.</p>}
          <div className="flex gap-2">
            <Button variant="outline" className="text-sm flex-1 border-slate-600 text-slate-300" onClick={onClose}>Cancel</Button>
            <Button
              className="bg-violet-700 hover:bg-violet-800 text-white text-sm flex-1"
              disabled={!scrolled || !checked}
              onClick={() => { onAccepted(selectedTier); onClose(); }}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" /> Accept as {tier.badge}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Public page ────────────────────────────────────────────────────────────
export default function BuilderAgreement() {
  const [selectedTier, setSelectedTier] = useState("standard");
  const tier = POLICY_TIERS.find(t => t.id === selectedTier);
  const TierIcon = tier.icon;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center gap-2">
        <Logo className="h-8 w-auto" />
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link to="/builder" className="text-sm text-slate-500 hover:text-slate-200">Builder Portal</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-sm text-slate-300 font-medium">Builder Agreement</span>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-white py-14 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
          <ShieldCheck className="w-3.5 h-3.5" /> Component Integrity & Escrow Policy
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Builder Agreement</h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Choose your policy tier. Real developers can stand out — reduce your escrow, unlock enterprise visibility, and earn more by proving your component's integrity.
        </p>
        <p className="text-xs text-slate-600 mt-4">Effective: January 1, 2025 — Last updated: May 2026</p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">

        {/* Tier switcher */}
        <div>
          <h2 className="text-lg font-black text-white mb-4 text-center">Choose Your Policy Tier</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {POLICY_TIERS.map(t => {
              const TIcon = t.icon;
              const isActive = selectedTier === t.id;
              return (
                <button key={t.id} onClick={() => setSelectedTier(t.id)}
                  className={`border-2 rounded-2xl p-5 text-left transition-all hover:scale-[1.01] ${isActive ? t.borderColor + " bg-slate-900 shadow-lg shadow-violet-900/20" : "border-slate-800 bg-slate-900/40 hover:border-slate-600"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <TIcon className={`w-5 h-5 ${isActive ? t.accentColor : "text-slate-500"}`} />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.badgeColor}`}>{t.badge}</span>
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${isActive ? "text-white" : "text-slate-400"}`}>{t.label}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{t.tagline}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className={`text-lg font-black ${isActive ? t.accentColor : "text-slate-600"}`}>{t.escrowPct}%</div>
                    <div className="text-[10px] text-slate-600 leading-tight">escrow<br/>holdback</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active tier detail card */}
          <div className={`mt-5 border rounded-2xl p-6 bg-slate-900 ${tier.borderColor}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${tier.borderColor} bg-slate-800`}>
                <TierIcon className={`w-5 h-5 ${tier.accentColor}`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-white mb-1`}>{tier.label}</h3>
                <p className="text-sm text-slate-400 mb-4">{tier.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    ["Escrow Holdback", `${tier.escrowPct}%`],
                    ["Rolling Window", `${tier.escrowDays} days`],
                    ["Clawback", tier.clawbackExposure],
                    ["Price Premium", tier.pricePreemium],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-slate-800/80 rounded-lg p-2.5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">{k}</p>
                      <p className="text-xs text-white font-semibold mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Escrow policy detail */}
        <div className="space-y-5">
          <h2 className="text-lg font-black text-white">Component Integrity & Escrow Policy</h2>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white mb-1">1. The Escrow Protocol</h3>
                <p className="text-sm text-slate-400">A 7-day rolling escrow is held on a portion of builder revenue to protect institutional buyers from capability drift. Standard builders: 20% holdback. Insured builders with $1M+ E&O: 5%. TMT-3 Verified: 10%. If Trust Score drops below 70 during escrow, funds are frozen pending remediation approval.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileWarning className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white mb-1">2. The Clawback Clause</h3>
                <p className="text-sm text-slate-400">If a component fails an adversarial stress test or TMT-3 Sentinel Truth Audit post-purchase, the platform may refund the most recent month's subscription to all affected users, debited from escrowed funds. Insured builders have this risk covered by their E&O policy.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Flame className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white mb-1">3. Integrity Gates — Shadow Audits</h3>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-slate-700">
                      <th className="text-left py-2 pr-3 text-slate-500 font-semibold">Gate</th>
                      <th className="text-left py-2 pr-3 text-slate-500 font-semibold">Frequency</th>
                      <th className="text-left py-2 text-slate-500 font-semibold">Action</th>
                    </tr></thead>
                    <tbody>
                      {INTEGRITY_GATES.map(g => (
                        <tr key={g.gate} className="border-b border-slate-800">
                          <td className={`py-2 pr-3 font-semibold ${g.severity === "critical" ? "text-red-400" : g.severity === "warning" ? "text-amber-400" : "text-blue-400"}`}>{g.gate}</td>
                          <td className="py-2 pr-3 text-slate-400">{g.freq}</td>
                          <td className="py-2 text-slate-400">{g.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BadgeCheck className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white mb-1">4. TMT-3 Sentinel Audit — Verified ◆ Badge</h3>
                <p className="text-sm text-slate-400">Components passing the TMT-3 audit earn a <strong className="text-violet-400">Verified ◆ badge</strong> and a <strong className="text-white">15% price premium</strong> in the marketplace. Tested for adversarial resilience, graceful failure (Honest Uncertainty signal), and Conscience Ethics Matrix compliance.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white mb-1">5. Delisting & Auto-Migration (Trust Score &lt; 50)</h3>
                <div className="mt-2 space-y-1.5">
                  {DELISTING_STEPS.map(s => (
                    <div key={s.n} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 bg-red-900/60 border border-red-700/50 rounded-full flex items-center justify-center text-[9px] font-bold text-red-400 shrink-0 mt-0.5">{s.n}</div>
                      <p className="text-sm text-slate-400"><strong className="text-slate-300">{s.label}:</strong> {s.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white mb-1">6. Insurance Safe Harbor (E&O / General Liability)</h3>
                <p className="text-sm text-slate-400 mb-2">Builders with verified $1M+ E&O coverage earn Safe Harbor status. Insurance covers clawback losses, reduces escrow to 5%, unlocks an Innovation Royalty boost (+5% revenue share), and surfaces your components under the "Insured Components Only" enterprise filter in the Marketplace. ACORD certificates are uploaded via the Builder Profile Credential Vault with automated expiry alerts at 30 days.</p>
                <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 text-xs text-amber-300">
                  <strong>Note:</strong> Insurance covers financial liability but does not replace Trust Engine quality controls. Insured builders can still be delisted if Trust Score remains below 50 for 30 consecutive days.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Free baseline + paid addendum — data preservation on downgrade */}
        <DowngradeDataPolicy />

        {/* Standard sections summary */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-white">Core Agreement Terms</h2>
          {[
            { icon: ShieldCheck, color: "text-violet-400", bg: "bg-violet-900/20 border-violet-800/40", title: "User Data Sovereignty (Law 3)", summary: "Zero-persistence processing. Documents must never be stored, transmitted, or logged beyond the active session." },
            { icon: AlertTriangle, color: "text-blue-400", bg: "bg-blue-900/20 border-blue-800/40", title: "X-Protocol Technical Standards", summary: "Official SDK, local processing, declared output schema compliance, and graceful degradation (Law 2) required." },
            { icon: Eye, color: "text-amber-400", bg: "bg-amber-900/20 border-amber-800/40", title: "Certification & Adversarial Testing", summary: "Privacy audits, 95%+ adversarial test pass rate, and continuous Trust Engine monitoring required for Certified (◇) or Official (◆) status." },
            { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-900/20 border-red-800/40", title: "Enforcement & Legal Penalties", summary: "Material breach: immediate delisting, revenue forfeiture, legal liability, permanent platform ban for intentional violations." },
            { icon: Star, color: "text-emerald-400", bg: "bg-emerald-900/20 border-emerald-800/40", title: "Builder Rights (Law 6)", summary: "Builders own their IP. No platform cloning. Acquisition path at 5,000+ installs / 95+ Trust Score at 24–36× monthly revenue." },
            { icon: ShieldCheck, color: "text-violet-400", bg: "bg-violet-900/20 border-violet-800/40", title: "IP & Proprietary Masking Clause", summary: "Any IP, trade secrets, or proprietary information is automatically masked, redacted, or tokenized in all platform-generated statements and reports. Enforced for every user — free or paid — under our standing protection practices, with no raw proprietary data exposed in shared outputs." },
          ].map(({ icon: Icon, color, bg, title, summary }) => (
            <div key={title} className={`border rounded-xl p-4 flex items-start gap-3 ${bg}`}>
              <Icon className={`w-4 h-4 ${color} shrink-0 mt-0.5`} />
              <div>
                <h3 className="font-bold text-white text-sm mb-0.5">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{summary}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Redaction notice */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 flex items-center gap-3">
          <EyeOff className="w-5 h-5 text-slate-500 shrink-0" />
          <p className="text-sm text-slate-500">
            Full arbitration clauses, governing law details, and additional proprietary terms are presented in the secure signup flow to protect platform IP.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/terms" className="text-xs text-violet-400 font-semibold hover:underline">Terms of Service</Link>
          <Link to="/privacy" className="text-xs text-violet-400 font-semibold hover:underline">Privacy Policy</Link>
          <Link to="/sensitive-intelligence-policy" className="text-xs text-violet-400 font-semibold hover:underline">Sensitive Intelligence Policy</Link>
        </div>
      </div>
    </div>
  );
}