import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ScrollText, ShieldCheck, BookOpenCheck, X, ChevronDown } from "lucide-react";
import { PWA_LEGAL_ASSETS } from "@/lib/pwaLegalAssets";

const ICONS = {
  eula: ScrollText,
  disclaimer: FileText,
  privacy: ShieldCheck,
  guide: BookOpenCheck,
};

export default function PwaLegalAssets() {
  const [openDoc, setOpenDoc] = useState(null);

  return (
    <Card className="border-slate-200">
      <CardContent className="pt-5 pb-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-900">PWA Download Package — Legal Assets</h2>
        </div>
        <p className="text-sm text-slate-500 -mt-2">
          Every PWA download bundles these four legal documents at the root folder, plus a consolidated <code className="text-xs">LEGAL.md</code>. On first boot, the Master EULA and Shell Disclaimer are presented in a forced acceptance modal before the shell becomes operational.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          {PWA_LEGAL_ASSETS.map((doc) => {
            const Icon = ICONS[doc.key] || FileText;
            const isOpen = openDoc === doc.key;
            return (
              <div key={doc.key} className="rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setOpenDoc(isOpen ? null : doc.key)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{doc.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{doc.subtitle}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-300 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 px-4 py-3 max-h-72 overflow-y-auto">
                    <pre className="text-[10px] leading-relaxed text-slate-600 whitespace-pre-wrap font-mono">{doc.body}</pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Clean &amp; Legal implementation:</span> When a PWA is rendered or downloaded, the four documents are injected into the local file structure, a forced acceptance modal gates the Master EULA + Shell Disclaimer on first boot, and a <code className="text-xs">LEGAL.md</code> is generated at the download root for easy access.
        </div>
      </CardContent>
    </Card>
  );
}