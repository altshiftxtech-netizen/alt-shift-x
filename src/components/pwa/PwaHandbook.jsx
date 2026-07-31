import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, X, ChevronDown, Download, Smartphone, ShieldCheck, Radio, FileText, Zap } from "lucide-react";

const SECTIONS = [
  {
    id: "intro",
    icon: Zap,
    title: "The Sovereign PWA Portal",
    body: (
      <>
        <p>This portal is your launchpad for installing and operating Alt+Shift+X as a standalone app. Every package here is an <strong className="text-slate-700">inert architectural shell</strong> — it contains no embedded intent until you direct it.</p>
        <p className="mt-2">Three download types are available: the <strong>Site Mirror PWA</strong> (mirrors the full site), the <strong>Agent Wrapper PWA</strong> (a portable neutral container for AI services), and your <strong>B.O.B.Init Builds</strong> (custom-rendered PWAs with hardened modules).</p>
      </>
    ),
  },
  {
    id: "install",
    icon: Download,
    title: "Installing Your PWA",
    body: (
      <>
        <p className="mb-2"><strong className="text-slate-700">Chrome / Edge / Android:</strong> Click <em>Install Now</em> when the native install prompt appears. The app installs to your desktop or home screen.</p>
        <p className="mb-2"><strong className="text-slate-700">iOS (iPhone / iPad):</strong> Tap <em>Add to Home Screen</em> and follow the Share → Add to Home Screen instructions. iOS does not support native install prompts.</p>
        <p className="mb-2"><strong className="text-slate-700">Firefox / Desktop Safari:</strong> Use <em>Download ZIP</em> to get a deployable package, or follow the on-screen manual instructions.</p>
        <p className="mt-2 text-xs text-slate-500">Every package includes a <code>manifest.json</code>, <code>sw.js</code> service worker, and an <code>index.html</code> shell — deploy them on any static host.</p>
      </>
    ),
  },
  {
    id: "hybrid",
    icon: Radio,
    title: "The Hybrid Mirror Strategy",
    body: (
      <>
        <p className="mb-2"><strong className="text-slate-700">The Shell (pwa.altshiftx.tech):</strong> The global entry point for installation, updates, and secure P2P signaling.</p>
        <p className="mb-2"><strong className="text-slate-700">The Local Fast-Path:</strong> Once installed, the PWA internally uses <code>.local</code> and mDNS for ultra-fast, zero-latency transfers when two devices are in the same room — no internet round-trip required.</p>
        <p className="mt-2 text-xs text-slate-500">This means your app boots from the global shell, then transparently upgrades to direct device-to-device speed whenever possible.</p>
      </>
    ),
  },
  {
    id: "operate",
    icon: ShieldCheck,
    title: "Operating Your Sovereign Asset",
    body: (
      <>
        <p className="mb-2"><strong className="text-slate-700">First Boot Gate:</strong> On first launch after download, an acceptance modal presents the Master EULA and Shell Disclaimer. You must explicitly accept before the shell becomes operational.</p>
        <p className="mb-2"><strong className="text-slate-700">Local-First:</strong> Your data stays on your device. The shell phones home no telemetry. You are the sole custodian of your data.</p>
        <p className="mb-2"><strong className="text-slate-700">Review Outputs:</strong> Anything an agent produces inside the shell is <em>your</em> product. Verify accuracy before relying on or transmitting output.</p>
      </>
    ),
  },
  {
    id: "legal",
    icon: FileText,
    title: "The Legal Download Package",
    body: (
      <>
        <p className="mb-2">Every ZIP download bundles four legal assets at the root, plus a consolidated <code>LEGAL.md</code>:</p>
        <ol className="space-y-1.5 list-decimal list-inside text-xs">
          <li><strong className="text-slate-700">Master EULA</strong> — shifts operational risk to the Operator.</li>
          <li><strong className="text-slate-700">Portable Disclaimer</strong> — No-Agreement notice preventing contract formation.</li>
          <li><strong className="text-slate-700">Privacy Manifest</strong> — technical proof of Local-First, encrypted architecture.</li>
          <li><strong className="text-slate-700">Operator Guide</strong> — Clean &amp; Legal compliance handbook.</li>
        </ol>
        <p className="mt-2 text-xs text-slate-500">Read the full text in the Legal Assets section at the bottom of this portal.</p>
      </>
    ),
  },
  {
    id: "deploy",
    icon: Smartphone,
    title: "Deploying Your Own Host",
    body: (
      <>
        <p className="mb-2">The Download ZIP contains everything needed to self-host:</p>
        <ul className="space-y-1 text-xs">
          <li>• <code>manifest.json</code> — PWA manifest</li>
          <li>• <code>index.html</code> — standalone shell</li>
          <li>• <code>sw.js</code> — service worker (offline caching)</li>
          <li>• <code>MASTER_EULA.txt</code>, <code>PORTABLE_DISCLAIMER.txt</code>, <code>PRIVACY_MANIFEST.txt</code>, <code>OPERATOR_GUIDE.txt</code></li>
          <li>• <code>LEGAL.md</code> — consolidated legal bundle</li>
          <li>• <code>README.txt</code> — deployment instructions</li>
        </ul>
        <p className="mt-2 text-xs text-slate-500">Upload to Netlify, Vercel, GitHub Pages, or your own server. The manifest + service worker make it installable as a standalone PWA.</p>
      </>
    ),
  },
];

export default function PwaHandbook() {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState("intro");

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="border-slate-300 text-slate-600 hover:bg-slate-100 gap-1.5 text-xs"
      >
        <BookOpen className="w-3.5 h-3.5" /> PWA Handbook
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" onClick={() => setOpen(false)}>
          <div
            className="max-w-2xl w-full max-h-[85vh] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Smartphone className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">The PWA Handbook</h2>
                  <p className="text-[10px] text-slate-400">Install, operate, and deploy your Sovereign PWA</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {SECTIONS.map(({ id, icon: Icon, title, body }) => {
                const isOpen = openSection === id;
                return (
                  <div key={id} className="border-b border-slate-100">
                    <button
                      onClick={() => setOpenSection(isOpen ? null : id)}
                      className="w-full flex items-center gap-2.5 px-5 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isOpen ? "text-slate-800" : "text-slate-400"}`} />
                      <span className={`flex-1 text-xs font-semibold ${isOpen ? "text-slate-800" : "text-slate-600"}`}>{title}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs text-slate-500 leading-relaxed space-y-1">
                        {body}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-300">PWA-HANDBOOK-1.0</span>
              <Button onClick={() => setOpen(false)} size="sm" className="bg-slate-800 hover:bg-slate-900 text-white text-xs">
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}