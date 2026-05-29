import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileText, ShieldCheck, Users, Scale, Clock } from "lucide-react";
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

function Highlight({ children }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-4">
      <p className="text-sm text-amber-800 leading-relaxed">{children}</p>
    </div>
  );
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/031f54965_altxlogo2.jpg" alt="Alt+Shift+X" className="h-8 w-auto" />
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-sm text-slate-500">Terms of Service</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <LegalDocumentViewer slug="terms_of_service">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <FileText className="w-3.5 h-3.5" />
            Legal Framework
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-3">Terms of Service</h1>
          <p className="text-slate-500 text-sm">
            Effective date: January 1, 2025. Last updated: May 2025.
          </p>
          <p className="text-slate-600 mt-3 leading-relaxed">
            These Terms of Service govern your access to and use of the Alt+Shift+X platform, including the marketplace, component APIs, builder tools, and mobile applications. By creating an account or using any part of the platform, you agree to these terms. Please read them carefully.
          </p>
        </div>

        {/* 1. Acceptance */}
        <Section icon={FileText} title="Acceptance and Eligibility">
          <p>
            The Alt+Shift+X platform is a business-to-business (B2B) service. To use the platform, you must be at least 18 years of age, acting on behalf of a registered organisation, and authorised to enter into binding agreements on that organisation's behalf.
          </p>
          <p>
            Accounts are provisioned at the organisation level. Individual users operate under the access roles assigned by their Organisation Owner or Administrator. By accepting these terms, you bind both yourself and your organisation to all provisions herein.
          </p>
        </Section>

        {/* 2. Platform Roles */}
        <Section icon={Users} title="Platform Roles and Responsibilities">
          <p>
            The platform serves two primary participant types, each with distinct rights and obligations.
          </p>
          <DataTable rows={[
            ["Role", "Definition", "Key Obligations"],
            ["Buyer", "An organisation that installs and uses components from the marketplace to process documents.", "Comply with component licensing terms; do not reverse-engineer components; manage API keys securely."],
            ["Builder", "An individual or organisation that develops and publishes components to the marketplace.", "Adhere to the X-Protocol; obtain marketplace approval before publishing; not exfiltrate user documents."],
            ["Organisation Owner", "The designated administrator with full control over an organisation's account.", "Manage team access and roles; responsible for all activity under the organisation's account."],
            ["Administrator", "A user granted elevated permissions within an organisation by the Owner.", "Manage API keys, subscriptions, and team members within granted scope."],
          ]} />
        </Section>

        {/* 3. Builder Constraints */}
        <Section icon={ShieldCheck} title="Builder Constraints and the X-Protocol">
          <Highlight>
            Marketplace Law 3 — Document Sovereignty: Builders are contractually and technically prohibited from creating, modifying, or distributing components that transmit, store, log, or otherwise process user documents outside the runtime Knowledge State. Violation of this law results in immediate component removal and permanent account suspension.
          </Highlight>
          <p>
            All components published to the Alt+Shift+X marketplace must conform to the X-Protocol, which enforces the following standards at the technical level.
          </p>
          <DataTable rows={[
            ["X-Protocol Requirement", "Description"],
            ["No external transmission", "Components may not make outbound network requests carrying document content."],
            ["No persistent writes", "Components may not write document data to any storage medium, database, or file system."],
            ["Ephemeral Knowledge State only", "Document content may only exist within the in-memory runtime context provided by the platform."],
            ["Schema-bound output", "Components must return only the structured fields declared in their published output schema."],
            ["No secondary analytics", "Components may not capture, sample, or analyse document content for training, profiling, or any secondary purpose."],
          ]} />
          <p>
            Builders who submit components for review certify that their component fully complies with the X-Protocol. The platform reserves the right to conduct technical audits at any time. Failed audits result in immediate suspension pending resolution.
          </p>
        </Section>

        {/* 4. Privacy-Specific Clauses */}
        <Section icon={Scale} title="Privacy-Specific Clauses">
          <p>
            The following protections apply specifically to the privacy of users and their data within the marketplace context.
          </p>
          <DataTable rows={[
            ["Feature", "Privacy Protection"],
            ["Builder Constraints", "Builders are contractually prohibited from creating components that transmit user data externally. All components must adhere to the X-Protocol."],
            ["Audit Transparency", "Enterprise subscribers have access to detailed Audit Logs covering two-factor authentication changes, API key creation and revocation, data access events, and administrative actions."],
            ["Right to Deletion", "Organisation Owners may delete their entire organisation. All personally identifiable information is purged within 30 days of a confirmed deletion request."],
            ["Trust Score Integrity", "Trust Scores are computed solely from aggregated usage metrics. Document content is never used as an input to any scoring or ranking system."],
            ["API Key Security", "API keys are hashed at rest and are never displayed in full after initial creation. Keys are subject to a 90-day rotation policy for Enterprise accounts."],
          ]} />
        </Section>

        {/* 5. Data Retention */}
        <Section icon={Clock} title="Data Retention Schedule">
          <p>
            The following retention periods govern how long different categories of data are held on the platform.
          </p>
          <DataTable rows={[
            ["Data Category", "Retention Period", "Notes"],
            ["Audit Logs", "12 months (Starter), 24 months (Pro and Enterprise)", "Accessible via the Audit Log dashboard for Enterprise accounts."],
            ["Support Tickets", "24 months after ticket closure", "Retained to support quality assurance and dispute resolution."],
            ["Transaction Records", "7 years", "Retained for tax and financial compliance under applicable law."],
            ["API Usage Metrics", "12–24 months by subscription tier", "Aggregated only; no document content is included."],
            ["Device Metadata", "90 days rolling", "Used solely for security monitoring; automatically purged."],
            ["Document Knowledge State", "Session duration only", "Destroyed immediately upon session termination. No recovery is possible."],
          ]} />
        </Section>

        {/* 6. Subscription and Payment */}
        <Section icon={FileText} title="Subscription, Payment, and Cancellation">
          <p>
            Access to the platform's API endpoints is governed by a subscription plan. Plans are billed monthly in advance. You may upgrade, downgrade, or cancel your subscription at any time from the Subscription Dashboard.
          </p>
          <ul className="space-y-2 pl-4">
            <li className="flex items-start gap-2"><span className="text-slate-400 mt-1">—</span><span>Cancellation takes effect at the end of the current billing period. No partial-period refunds are issued.</span></li>
            <li className="flex items-start gap-2"><span className="text-slate-400 mt-1">—</span><span>All payment processing is handled by Stripe. Alt+Shift+X does not store card details.</span></li>
            <li className="flex items-start gap-2"><span className="text-slate-400 mt-1">—</span><span>Builder revenue payouts are processed monthly, subject to a minimum payout threshold and verification of a connected Stripe account.</span></li>
            <li className="flex items-start gap-2"><span className="text-slate-400 mt-1">—</span><span>Enterprise pricing is negotiated directly and governed by a separate Order Form.</span></li>
          </ul>
        </Section>

        {/* 7. Limitation of Liability */}
        <Section icon={Scale} title="Limitation of Liability">
          <p>
            The platform is provided on an "as is" and "as available" basis. To the maximum extent permitted by applicable law, Alt+Shift+X disclaims all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </p>
          <p>
            In no event shall Alt+Shift+X's aggregate liability to any party exceed the total fees paid by that party in the twelve months preceding the event giving rise to the claim. This limitation applies regardless of the form of action, whether in contract, tort, or otherwise.
          </p>
        </Section>

        {/* 8. Governing Law */}
        <Section icon={Scale} title="Governing Law and Dispute Resolution">
          <p>
            These Terms are governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict-of-law principles.
          </p>
          <p>
            Any dispute arising out of or relating to these Terms or your use of the platform shall first be submitted to binding arbitration administered by the American Arbitration Association, except where prohibited by applicable law. Class action waiver: you agree to bring disputes only in your individual capacity and not as a plaintiff or class member in any purported class or representative proceeding.
          </p>
        </Section>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-1">Legal Enquiries</h3>
          <p className="text-sm text-slate-500 mb-3">
            For questions about these Terms, Builder licensing agreements, Enterprise Order Forms, or to obtain a Data Processing Agreement, contact our legal team.
          </p>
          <p className="text-sm font-medium text-slate-700">legal@altshiftx.com</p>
          <div className="flex gap-3 mt-4">
            <Link to="/privacy" className="text-xs text-violet-600 font-semibold hover:underline">Privacy Policy</Link>
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