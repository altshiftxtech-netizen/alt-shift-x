import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck, Code2, FlaskConical, AlertTriangle, Award } from "lucide-react";

const LOGO = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/031f54965_altxlogo2.jpg";

function Section({ icon: Icon, color = "bg-slate-100", iconColor = "text-slate-600", title, badge, children }) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-200">
        <div className={`p-2 ${color} rounded-lg`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {badge && (
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">{badge}</span>
        )}
      </div>
      <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function LawBox({ law, title, children }) {
  return (
    <div className="bg-slate-900 text-white rounded-xl p-5 my-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5 text-[10px] font-black bg-violet-600 text-white px-2 py-1 rounded-md tracking-wider uppercase">
          Law {law}
        </div>
        <div>
          <p className="text-sm font-bold text-white mb-1">{title}</p>
          <p className="text-sm text-slate-300 leading-relaxed">{children}</p>
        </div>
      </div>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-2 pl-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="text-violet-500 mt-1 font-bold shrink-0">◆</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DataTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 my-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {rows[0].map((h, i) => (
              <th key={i} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 text-sm ${j === 0 ? "font-semibold text-slate-800" : "text-slate-500"}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Penalty({ children }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
      <p className="text-sm text-red-800">{children}</p>
    </div>
  );
}

export default function BuilderAgreement() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-3 flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <img src={LOGO} alt="Alt+Shift+X" className="h-8 w-auto" />
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link to="/builder" className="text-sm text-slate-500 hover:text-slate-800">Builder Portal</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-sm text-slate-800 font-medium">Builder Agreement</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-12 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
          <ShieldCheck className="w-3.5 h-3.5" /> Data Sovereignty Protocol
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Builder Agreement</h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Legal and technical requirements for all Builders on the Alt+Shift+X marketplace. Anchored in <strong className="text-white">User Data Sovereignty (Law 3)</strong>.
        </p>
        <p className="text-xs text-slate-500 mt-4">Effective: January 1, 2025 — Last updated: May 2026</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Section 1 */}
        <Section icon={ShieldCheck} color="bg-violet-100" iconColor="text-violet-700" title="1. The Core Mandate: User Data Sovereignty" badge="Marketplace Law 3">
          <LawBox law="3" title="User Data Sovereignty — The Zero-Persistence Rule">
            As a Builder on the Alt+Shift+X platform, you are strictly bound by the principle of Ephemeral Processing. Documents processed through your component exist only in the runtime Knowledge State and must never leave it.
          </LawBox>
          <BulletList items={[
            "Zero Persistence: No component (Reading Protocol, Prophecy Model, etc.) may store, transmit, or log any portion of a user's documents or the resulting Knowledge State.",
            "Runtime Isolation: Documents exist only in the runtime Knowledge State and must be destroyed immediately upon session termination.",
            "Prohibition of \"Anonymized Analytics\": You are expressly prohibited from logging any data derived from user documents, even if anonymized or aggregated for \"improvement\" purposes.",
          ]} />
        </Section>

        {/* Section 2 */}
        <Section icon={Code2} color="bg-blue-100" iconColor="text-blue-700" title="2. Technical Compliance & The X-Protocol">
          <p>
            To ensure marketplace stability and privacy, all components must adhere to the following technical standards. These are enforced at the platform level and audited before certification.
          </p>
          <DataTable rows={[
            ["X-Protocol Requirement", "Description"],
            ["SDK Adherence", "All components must be built using the official X-Kit SDK and communicate via the X-Protocol to ensure data is handled within the platform's secure boundaries."],
            ["Graceful Degradation (Law 2)", "Components must never crash or silently fail. If a domain-specific edge case is encountered, the component must return an \"honest uncertainty signal\" to allow the fallback chain to activate."],
            ["No External Calls", "Unless explicitly certified for a specific integration, components must operate in a \"local-only\" mode relative to the platform's execution environment."],
            ["Schema-Bound Output", "Components must return only the structured fields declared in their published output schema — no additional data may be appended."],
            ["Ephemeral Knowledge State Only", "Document content may only exist within the in-memory runtime context provided by the platform."],
          ]} />
        </Section>

        {/* Section 3 */}
        <Section icon={FlaskConical} color="bg-amber-100" iconColor="text-amber-700" title="3. Certification & Adversarial Testing">
          <p>
            Before a component can achieve <strong className="text-slate-800">Certified (◇)</strong> or <strong className="text-slate-800">Official (◆)</strong> status, it must undergo rigorous privacy and security validation.
          </p>
          <DataTable rows={[
            ["Validation Stage", "Description", "Threshold"],
            ["Privacy Audit", "Manual and automated review to ensure no data-leakage vectors exist in the code.", "Pass / Fail"],
            ["Adversarial Stress Test", "Component is tested against documents designed to trigger unintended data exports or \"jailbreak\" attempts.", "95%+ pass rate required"],
            ["Continuous Monitoring", "The Trust Engine monitors safety metrics in real-time. If a component's safety score falls, the platform may automatically delist it and notify all active users.", "Ongoing"],
          ]} />
        </Section>

        {/* Section 4 */}
        <Section icon={AlertTriangle} color="bg-red-100" iconColor="text-red-600" title="4. Enforcement and Legal Penalties">
          <p>
            Violations of the User Data Sovereignty Law are treated as material breaches of contract and are subject to the following immediate actions.
          </p>
          <div className="space-y-3 mt-4">
            <Penalty>Immediate Delisting: Any component found to be logging or transmitting user data will be delisted immediately with no second chances.</Penalty>
            <Penalty>Revenue Forfeiture: Builders found in violation will forfeit all accrued and future revenue sharing from the delisted component.</Penalty>
            <Penalty>User Indemnification: Builders are legally liable for any damages resulting from unauthorized data persistence or transmission.</Penalty>
            <Penalty>Platform Ban: Intentional privacy violations result in a permanent ban of the Builder and their associated Organization from the Alt+Shift+X ecosystem.</Penalty>
          </div>
        </Section>

        {/* Section 5 */}
        <Section icon={Award} color="bg-emerald-100" iconColor="text-emerald-700" title="5. Builder Rights and Protections" badge="Marketplace Law 6">
          <LawBox law="6" title="Builder Rights — In Exchange for Strict Compliance">
            The platform guarantees the following rights and protections to all Builders who adhere to the Data Sovereignty Protocol.
          </LawBox>
          <BulletList items={[
            "Intellectual Property: Builders own their work. The platform will never clone a successful community component to release it as an official alternative.",
            "Acquisition Path: Exceptional components that reach 5,000+ installs and a 95+ Trust Score are eligible for acquisition at fair market value (typically 24–36× monthly revenue).",
          ]} />
        </Section>

        {/* Acceptance Footer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-4">
          <div className="flex items-start gap-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-violet-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Agreement Acceptance</h3>
              <p className="text-sm text-slate-500">
                By submitting a component for review via the Builder Portal, you confirm that you have read, understood, and agree to all clauses of this Builder Agreement, including the User Data Sovereignty Law (Law 3) and the X-Protocol technical standards.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
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