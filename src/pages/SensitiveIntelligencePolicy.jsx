import React from "react";
import { ShieldAlert, AlertTriangle, FileText, CheckSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SharedNav from "@/components/SharedNav";

const FLAGGED_CATEGORIES = [
  "Military applications or weapons systems",
  "Nuclear, radiological, biological, or chemical weapons",
  "Mass casualty or mass shooting facilitation",
  "Unauthorized law enforcement surveillance",
  "Government systems without proper authorization",
  "Malware, ransomware, or cyberweapon development",
  "Trafficking or exploitation of persons",
  "Fraudulent financial instruments",
  "Content designed to cause mass harm or panic",
  "Any AI designed to deceive at scale (deepfakes, disinformation)"
];

const BUILDER_OBLIGATIONS = [
  "Disclose all intended use cases at submission",
  "Not misrepresent the component's capabilities or purpose",
  "Cooperate fully with any platform investigation",
  "Acknowledge that platform data may be shared with legal authorities upon lawful request",
  "Maintain accurate documentation of component training data sources",
  "Not circumvent platform trust-scoring mechanisms"
];

export default function SensitiveIntelligencePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <SharedNav mode="user" />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Sensitive Intelligence Access & Reporting Policy</h1>
            <p className="text-slate-500 mt-1 text-sm">Effective: January 1, 2026 · Version 1.0</p>
            <p className="text-slate-600 mt-2">This policy governs all builders, developers, subscribers, and API partners who create, distribute, or use AI components on the Alt+Shift+X platform.</p>
          </div>
        </div>

        {/* Purpose */}
        <Card className="mb-6 border-slate-200">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-violet-600" /> Purpose & Intent</h2>
            <p className="text-slate-700 text-sm leading-relaxed mb-3">
              Alt+Shift+X is committed to building a safe, transparent, and legally compliant AI component marketplace. This policy exists as a <strong>liability protection device</strong> for all parties and serves to ward off bad actors who wish to use AI maliciously, in bad faith, or in ways that endanger individuals or communities.
            </p>
            <p className="text-slate-700 text-sm leading-relaxed mb-3">
              By listing, selling, using, or interacting with any component on this platform, all parties enter into a <strong>full prior understanding</strong> that Alt+Shift+X reserves the right — and will exercise its obligation — to report components, usage patterns, or account activities to <strong>legal investigative authorities</strong> when there is reasonable cause to believe harm may result or laws may be violated.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm font-medium flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                This is not a threat but a transparency statement. We protect our users, our builders, and the public by operating with full legal cooperation and proactive safety reporting.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Flagged Categories */}
        <Card className="mb-6 border-red-200">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" /> Automatically Flagged Intent Categories
            </h2>
            <p className="text-slate-600 text-sm mb-4">
              Components that exhibit indicators of the following use cases will be automatically quarantined, reviewed, and potentially reported to authorities:
            </p>
            <ul className="space-y-2">
              {FLAGGED_CATEGORIES.map((cat, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="w-5 h-5 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  {cat}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Builder Obligations */}
        <Card className="mb-6 border-slate-200">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600" /> Builder & Developer Obligations
            </h2>
            <p className="text-slate-600 text-sm mb-4">All builders, developers, and API partners acknowledge and agree to:</p>
            <ul className="space-y-2">
              {BUILDER_OBLIGATIONS.map((ob, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {ob}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Reporting Process */}
        <Card className="mb-6 border-slate-200">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Reporting Process</h2>
            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center flex-shrink-0">1</div>
                <div><strong>Detection:</strong> Our AI Trust Engine and human reviewers continuously scan published and submitted components for intent signals.</div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center flex-shrink-0">2</div>
                <div><strong>Quarantine:</strong> Flagged components are immediately removed from the marketplace and the builder notified.</div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center flex-shrink-0">3</div>
                <div><strong>Investigation:</strong> Platform security reviews all flagged components within 48 hours.</div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center flex-shrink-0">4</div>
                <div><strong>Reporting:</strong> Where legally required or where clear harm potential exists, we report to relevant law enforcement or regulatory bodies with full documentation.</div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center flex-shrink-0">5</div>
                <div><strong>Quick Reporting Link:</strong> Any user can submit a concern at <a href="mailto:security@altshiftx.com" className="text-violet-600 hover:underline">security@altshiftx.com</a> for immediate triage.</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acknowledgment */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-2">Universal Acknowledgment</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            By registering, building, publishing, or using the Alt+Shift+X platform in any capacity, all parties acknowledge full prior understanding of this Sensitive Intelligence Access & Reporting Policy. This acknowledgment is binding and constitutes agreement between the user/builder and Alt+Shift+X. No component — regardless of stated purpose — is exempt from this policy.
          </p>
          <p className="text-slate-400 text-xs mt-4">This policy covers all components built, sold, marketed, or accessed on the platform. Last updated May 2026.</p>
        </div>
      </div>
    </div>
  );
}