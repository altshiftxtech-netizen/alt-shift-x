import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import SharedNav from "@/components/SharedNav";

// SOVEREIGN PWA: LEGAL NOTICE & SHELL-INVARIANCE DISCLAIMER
// Full legal text rendered as a static policy page at /legal/sovereign-pwa.
const SECTIONS = [
  {
    title: "1. Architectural Neutrality (The \"Shell\" Doctrine)",
    body: "This Progressive Web App (PWA) and its associated infrastructure are provided as an Inert Architectural Shell. This PWA is a neutral container for the execution of user-defined logic and the processing of user-provided data. It does not possess \"intent,\" \"governance,\" or \"agency.\" The existence of this shell does not constitute a participating factor in any business, legal, or operational activities conducted by the user.",
  },
  {
    title: "2. No Agreement With AltShiftX.Tech",
    body: "Usage of this shell, the Sovereign substrate, or any associated components does not create a contract, fiduciary relationship, partnership, or joint venture with altshiftx.tech, its developers, or its infrastructure providers. Access to this tool is provided on an \"as-is\" architectural basis. No warranties, express or implied, are granted.",
  },
  {
    title: "3. Total Liability Shift",
    body: "The Operator (User) assumes 100% responsibility for the configuration, deployment, and misuse of this shell. Any local, national, or international compliance requirements (including but not limited to Data Privacy, Financial Regulations, and Professional Licensing) are the sole responsibility of the Operator. altshiftx.tech is not a \"governing factor\" and shall not be held liable for any damages—direct, indirect, or incidental—arising from the Operator's use of the substrate.",
  },
  {
    title: "4. No Professional Advice",
    body: "While this PWA may provide access to Reason Councils (X4) and advisory suites, these are computational frameworks only. They do not replace the judgment of a licensed professional. If you require legal, financial, or medical rulings, you must consult a qualified human professional.",
  },
  {
    title: "5. Indemnification",
    body: "By initializing this PWA, the Operator agrees to indemnify and hold harmless all infrastructure providers from any claims, liabilities, or expenses resulting from the Operator's intent, data, or output.",
  },
];

export default function SovereignPwaPolicy() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <SharedNav mode="user" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="border-slate-300 text-slate-600 gap-1.5 text-xs">
            <Link to="/dashboard/pwa"><ArrowLeft className="w-3.5 h-3.5" /> Back to PWA Portal</Link>
          </Button>
        </div>

        <Card className="border-slate-200">
          <CardContent className="pt-6 pb-6 space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
              <ShieldAlert className="w-7 h-7 text-amber-600 shrink-0" />
              <div>
                <h1 className="text-xl font-black text-[#343A40]" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
                  Sovereign PWA: Legal Notice & Shell-Invariance Disclaimer
                </h1>
                <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wide">Important — Read Before Initializing the Substrate</p>
              </div>
            </div>

            <div className="space-y-5">
              {SECTIONS.map((s) => (
                <div key={s.title}>
                  <h2 className="font-bold text-[#343A40] text-sm mb-1.5">{s.title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 italic">
                By installing or initializing the Sovereign PWA, you acknowledge that you have read, understood, and agree to this disclaimer.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}