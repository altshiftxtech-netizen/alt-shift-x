import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Shield, Lock, Eye, Database, Smartphone, Globe } from "lucide-react";
import LegalDocumentViewer from "@/components/admin/LegalDocumentViewer";

function Section({ icon: Icon, title, children }) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-200">
        <div className="p-2 bg-slate-100 rounded-lg">
          <Icon className="w-4 h-4 text-slate-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Callout({ children }) {
  return (
    <div className="bg-slate-900 text-white rounded-xl p-5 my-4">
      <div className="flex items-start gap-3">
        <Lock className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed text-slate-200">{children}</p>
      </div>
    </div>
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

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/031f54965_altxlogo2.jpg" alt="Alt+Shift+X" className="h-8 w-auto" />
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-sm text-slate-500">Privacy Policy</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <LegalDocumentViewer slug="privacy_policy">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Shield className="w-3.5 h-3.5" />
            Privacy Framework
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-3">Privacy Policy</h1>
          <p className="text-slate-500 text-sm">
            Effective date: January 1, 2025. Last updated: May 2025.
          </p>
          <p className="text-slate-600 mt-3 leading-relaxed">
            This Privacy Policy describes how Alt+Shift+X ("we," "our," or "the platform") collects, uses, and protects information across our web, mobile, and tablet platforms. Our privacy framework is anchored in the principle of User Data Sovereignty — documents you process remain yours, and yours alone.
          </p>
        </div>

        {/* 1. Data Collection */}
        <Section icon={Database} title="Data Collection and Usage">
          <p>
            We collect the minimum data necessary to operate the platform. The following table summarises what we collect, why, and how long it is retained.
          </p>
          <DataTable rows={[
            ["Data Type", "Purpose", "Retention"],
            ["Name and business email", "Account creation and authentication", "Duration of account"],
            ["Organisation details (industry, size, country)", "Regional compliance and marketplace matching", "Duration of account"],
            ["Authentication credentials", "Secure login and session management", "Hashed; duration of account"],
            ["Stripe Customer and Subscription IDs", "Payment processing reference (no card data stored)", "7 years (tax compliance)"],
            ["Component usage metrics (query counts, response times, error rates)", "Trust Score computation and recommendations", "12–24 months by tier"],
            ["Device identifiers and user agent strings", "Security monitoring and brute-force protection (mobile/tablet only)", "90 days rolling"],
          ]} />
          <p>
            We do not sell, rent, or share your personal information with third parties for advertising or marketing purposes.
          </p>
        </Section>

        {/* 2. Data Sovereignty */}
        <Section icon={Lock} title="Data Sovereignty and Document Privacy">
          <Callout>
            Critical Standard — Marketplace Law 3: No component on this platform may store, transmit, or log user documents. Documents are held exclusively in the runtime Knowledge State and are permanently destroyed upon session termination. This is a contractual and technical guarantee.
          </Callout>
          <p>
            Ephemeral Processing is the foundation of our document intelligence architecture. When you submit a document for extraction:
          </p>
          <ul className="space-y-2 pl-4">
            <li className="flex items-start gap-2"><span className="text-slate-400 mt-1">—</span><span>The document is loaded into the runtime Knowledge State of the selected component.</span></li>
            <li className="flex items-start gap-2"><span className="text-slate-400 mt-1">—</span><span>Extraction occurs entirely in memory; no copy is written to disk or transmitted externally.</span></li>
            <li className="flex items-start gap-2"><span className="text-slate-400 mt-1">—</span><span>Upon session end, the Knowledge State is cleared and the document is irrecoverably destroyed.</span></li>
            <li className="flex items-start gap-2"><span className="text-slate-400 mt-1">—</span><span>Anonymised analytics are strictly prohibited. We do not analyse document content for any secondary purpose.</span></li>
          </ul>
        </Section>

        {/* 3. Third-Party Integrations */}
        <Section icon={Globe} title="Third-Party Integrations">
          <DataTable rows={[
            ["Integration", "Provider", "Data Shared", "Standard"],
            ["Payment Processing", "Stripe", "Billing identifiers only; no card data passes through our servers", "PCI DSS compliant"],
            ["Transactional Email", "SendGrid", "Recipient email address and notification content", "GDPR data processing agreement"],
            ["Authentication (optional)", "Google and Microsoft OAuth 2.0", "Email address and profile name for SSO login", "OAuth 2.0 / OpenID Connect"],
            ["Enterprise SSO (optional)", "Customer-provided SAML IdP", "Configured by organisation administrator", "SAML 2.0"],
          ]} />
          <p>
            All third-party providers are bound by data processing agreements. We conduct annual reviews to ensure continued compliance.
          </p>
        </Section>

        {/* 4. Mobile & Tablet */}
        <Section icon={Smartphone} title="Mobile and Tablet Applications">
          <p>
            The Alt+Shift+X mobile and tablet applications are subject to all policies stated above, with the following additional statements required by Apple App Store and Google Play Store guidelines.
          </p>
          <DataTable rows={[
            ["Topic", "Statement"],
            ["Location data", "The app does not track or request precise geographic location. Country of registration is used solely for regional marketplace compliance."],
            ["Cross-app tracking", "Alt+Shift+X does not track user activity across third-party apps or websites for advertising purposes."],
            ["In-app notifications", "Real-time alerts (Trust Score changes, security alerts, quota warnings) are delivered via WebSockets and require explicit user opt-in within the app settings."],
            ["Device data", "Standard device identifiers and user agent strings are collected for security monitoring only and are purged on a 90-day rolling basis."],
            ["Camera and microphone", "The app does not request camera or microphone access."],
          ]} />
        </Section>

        {/* 5. GDPR */}
        <Section icon={Eye} title="GDPR and Regulatory Compliance">
          <p>
            Alt+Shift+X is designed with Privacy by Design and Privacy by Default principles. For users in the European Economic Area, the following rights apply.
          </p>
          <DataTable rows={[
            ["Your Right", "How to Exercise It"],
            ["Right to access", "Request a full export of your data via the P-50 data export function in account settings."],
            ["Right to deletion", "Organisation Owners may delete their organisation. All PII is purged within 30 days of the request."],
            ["Right to portability", "Your component stack and configuration can be exported as a YAML file from your account settings."],
            ["Right to rectification", "Update personal information directly in account settings at any time."],
            ["Right to object", "Contact our Data Protection Officer at privacy@altshiftx.com to lodge an objection."],
          ]} />
          <p>
            A Data Processing Agreement (DPA) is available to all organisations upon request. Enterprise subscribers receive a pre-executed DPA as part of their onboarding package.
          </p>
          <p className="mt-3">
            For security, all data at rest is protected with AES-256 encryption and all data in transit uses TLS 1.3. API keys and two-factor authentication secrets are rotated every 90 days.
          </p>
        </Section>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-1">Questions or Concerns</h3>
          <p className="text-sm text-slate-500 mb-3">
            For privacy-related inquiries, data requests, or to obtain a copy of our Data Processing Agreement, please contact our Data Protection Officer.
          </p>
          <p className="text-sm font-medium text-slate-700">privacy@altshiftx.com</p>
          <div className="flex gap-3 mt-4">
            <Link to="/terms" className="text-xs text-violet-600 font-semibold hover:underline">Terms of Service</Link>
            <span className="text-slate-300">|</span>
            <Link to="/builder/agreement" className="text-xs text-violet-600 font-semibold hover:underline">Builder Agreement</Link>
            <span className="text-slate-300">|</span>
            <Link to="/" className="text-xs text-slate-500 hover:underline">Back to Platform</Link>
          </div>
        </div>
        </LegalDocumentViewer>
      </div>
    </div>
  );
}