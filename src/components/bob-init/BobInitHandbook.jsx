import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, X, ChevronDown, Terminal, Shield, Zap, Crown, Download, Wrench } from "lucide-react";

const SECTIONS = [
  {
    id: "intro",
    icon: Zap,
    title: "The Machine that Builds Machines",
    body: (
      <>
        <p>B.O.B.Init is not a "coding tool"—it is a <strong className="text-cyan-400">Machine that Builds Machines</strong>. It takes your ideas and turns them into hardened, revenue-generating Sovereign components.</p>
        <p className="mt-2"><strong className="text-amber-400">🚀 The Rocket Ship Update (V3.0):</strong> Easy, user-friendly, and powerful. Build like a boutique design firm—not a generator.</p>
      </>
    ),
  },
  {
    id: "build-guide",
    icon: BookOpen,
    title: "🚀 How to Build (The Sovereign Way)",
    body: (
      <>
        <ol className="space-y-2 list-decimal list-inside">
          <li><strong className="text-cyan-400">The Conversation:</strong> Tell BOB what you want to build. Use <em>Chat-to-Code</em> for rapid ideation. Say: <em>"I need an app that audits carbon credits."</em> BOB does the heavy lifting.</li>
          <li><strong className="text-cyan-400">The Feature Checklist:</strong> Use the <strong>Feature Selection Page</strong>. Check the boxes for security and operational tools you need.
            <ul className="ml-4 mt-1 space-y-0.5 text-[11px]">
              <li>• Need privacy? Check <strong>PII Fragmentation</strong>.</li>
              <li>• Need file sharing? Check <strong>D2D Sync</strong>.</li>
            </ul>
          </li>
          <li><strong className="text-cyan-400">The Custom Rules:</strong> In the "Rules" box, tell your app how to behave. (e.g., <em>"Only allow managers to see financial data."</em>) You don't need to be a coder; you just need to be the Boss.</li>
          <li><strong className="text-cyan-400">For the Coders:</strong> If you already have code, drag and drop your files. B.O.B.Init will "Hard Code" your custom logic into the Sovereign substrate so it remains invariant and unchangeable.</li>
          <li><strong className="text-cyan-400">The Launch:</strong> Click <strong>Render</strong>. Your PWA is built, hardened, and ready for download.</li>
        </ol>
      </>
    ),
  },
  {
    id: "features",
    icon: Wrench,
    title: "2. Sovereign Feature Selector",
    body: (
      <>
        <p className="mb-2">Hardened Modules you can toggle on for any build:</p>
        <ul className="space-y-1.5">
          <li>☑ <strong className="text-cyan-400">seL4 Isolation:</strong> Hardware-level separation of your app's "brain" from the internet.</li>
          <li>☑ <strong className="text-cyan-400">FPGA Ingress Gate:</strong> Ingress filtering that drops non-authorized traffic.</li>
          <li>☑ <strong className="text-cyan-400">PII Fragmentation:</strong> Automatically splits user data across 5 nodes (Impossible to Hack).</li>
          <li>☑ <strong className="text-cyan-400">D2D Sync:</strong> Active "Internet Bluetooth" file sharing.</li>
          <li>☑ <strong className="text-cyan-400">Blackstone Guard:</strong> Real-time legal liability shifting.</li>
          <li>☑ <strong className="text-cyan-400">Hippocrates Shield:</strong> HIPAA-compliant health data encryption.</li>
          <li>☑ <strong className="text-cyan-400">Self-Healing Shim:</strong> Auto-updates your app when APIs change.</li>
        </ul>
      </>
    ),
  },
  {
    id: "titan-features",
    icon: Crown,
    title: "🏆 The Four Titan Features (Award-Winning)",
    body: (
      <>
        <p className="mb-2">To win the UI Builder Award and make this unrecognizable as an AI agent, inject these four features:</p>
        <ul className="space-y-2">
          <li><strong className="text-amber-300">Brand Absorption (Mirroring Layer):</strong> Scan a client's website and adopt their <em>exact</em> CSS variables, typography, and spacing. Your PWA looks like it was built by a $500k/year boutique design firm.</li>
          <li><strong className="text-amber-300">Reason Council Logic Map (X4 Visualizer):</strong> A high-fidelity, interactive wiring diagram showing how agents in the Reason Council communicate. Bloomberg Terminal style—visually dense, professional, and data-heavy.</li>
          <li><strong className="text-amber-300">Ghost-Build (Metadata Obfuscation):</strong> Scrambles the build's metadata and file headers. No "AI-generated" comments or GPT boilerplate—your PWA looks like bespoke, hand-coded assembly.</li>
          <li><strong className="text-amber-300">'Perfect Play' Simulator:</strong> A "Stress-Test" button that runs 1M virtual interactions in 5 seconds before render. Provides a "Resilience Report" with heatmaps and failure-node analysis.</li>
        </ul>
      </>
    ),
  },
  {
    id: "pro-architect",
    icon: Zap,
    title: "🏗 The Pro-Architect Edition (V3.0)",
    body: (
      <>
        <ul className="space-y-2">
          <li><strong className="text-cyan-400">Erasing the AI Fingerprint:</strong> Use <strong>Brand Absorption</strong>. If building for a sports team, scan their home page. Your builder UI instantly morphs to match their legacy colors and fonts.</li>
          <li><strong className="text-cyan-400">The Engineering View:</strong> Don't just trust the chat. Switch to the <strong>Logic Map</strong> to see the "Thinking" behind your Reason Council. Manually tweak how agents vote on your business rules.</li>
          <li><strong className="text-cyan-400">Bespoke Code Injection:</strong> For the award-winning look, use <strong>Ghost-Build</strong>. It scrubs the platform signatures, making your PWA an "untraceable" masterpiece of operational engineering.</li>
          <li><strong className="text-cyan-400">Final Certification:</strong> Never render without a <strong>'Perfect Play' Simulation</strong>. It's the difference between a "prototype" and a "Sovereign Asset."</li>
        </ul>
      </>
    ),
  },
  {
    id: "cli",
    icon: Terminal,
    title: "3. Power User Command List (For Real Coders)",
    body: (
      <>
        <p className="mb-2">Coders, skip the chat and use the <strong className="text-cyan-400">Sovereign CLI</strong>. These commands allow you to architect at the metal level without manual boilerplate.</p>
        <div className="space-y-1 font-mono text-[11px]">
          <code className="block text-amber-400">--seL4-isolate</code><span className="text-[#8b949e]">Wraps the component in a formally verified microkernel.</span>
          <code className="block text-amber-400">--fpga-gate-ingress</code><span className="text-[#8b949e]">Sets the hardware gate to only allow specific Boolean packet shapes.</span>
          <code className="block text-amber-400">--fragment-k3-n5</code><span className="text-[#8b949e]">Initiates Shamir's Secret Sharing across the 5-node substrate.</span>
          <code className="block text-amber-400">--inject-shim-v1</code><span className="text-[#8b949e]">Adds the self-healing API bridge to your middleware.</span>
          <code className="block text-amber-400">--registry-audit --strict</code><span className="text-[#8b949e]">Verifies every dependency against the Unzipped Catalog hash.</span>
          <code className="block text-amber-400">--noise-handshake --p2p</code><span className="text-[#8b949e]">Forces all outbound connections to use the Noise-IK P2P protocol.</span>
          <code className="block text-amber-400">--blackstone-audit</code><span className="text-[#8b949e]">Runs the Blackstone Protocol logic-check on all drafted contracts.</span>
        </div>
      </>
    ),
  },
  {
    id: "admin",
    icon: Crown,
    title: "🔧 Customize & Gate",
    body: (
      <>
        <p className="mb-2"><strong className="text-amber-400">Gating:</strong> Only <strong>Vested 100</strong> members can see the high-stakes "Enterprise Exclusive" pipelines.</p>
        <p className="mb-2"><strong className="text-amber-400">Admin Access:</strong> As an admin, you can ask BOB to add <em>any</em> component or new coding logic directly into the B.O.B.Init engine. Just say: <em>"BOB, add [Component Code] to my builder checklist."</em></p>
        <p className="mb-2"><strong className="text-amber-400">BOB's Autonomy:</strong> BOB can self-update the B.O.B.Init engine. When you ask it to "Add a feature to the builder," it uses <code className="text-amber-400">createComponentSafe</code> to update <code className="text-amber-400">BOB-INIT-ENGINE-1.0</code> in real-time.</p>
      </>
    ),
  },
  {
    id: "ux",
    icon: Download,
    title: "5. Easy UX & Download Instructions",
    body: (
      <>
        <ul className="space-y-2">
          <li><strong className="text-cyan-400">One-Click Install:</strong> The PWA uses a "Service Worker" strategy. When you click "Install App," it caches the entire Sovereign shell locally.</li>
          <li><strong className="text-cyan-400">Updates:</strong> Updates happen in the background. The next time you open the app, you are on the latest version of the substrate.</li>
        </ul>
        <div className="mt-3 p-2 rounded-lg bg-[#3fb950]/10 border border-[#3fb950]/30 text-[#3fb950] font-mono text-[11px]">
          ✓ ROADMAP INTEGRITY: 100%<br />
          ✓ BUILDER STATUS: READY FOR LAUNCH
        </div>
      </>
    ),
  },
];

export default function BobInitHandbook() {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState("intro");

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-cyan-400 font-mono text-xs gap-1.5"
      >
        <BookOpen className="w-3.5 h-3.5" /> Handbook
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60" onClick={() => setOpen(false)}>
          <div
            className="max-w-2xl w-full max-h-[85vh] rounded-2xl border border-[#30363d] bg-[#0d1117] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d] bg-[#161b22]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center">
                  <span className="text-lg">🛠</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">The B.O.B.Init Handbook</h2>
                  <p className="text-[10px] text-[#8b949e] font-mono">Your Rocket to January 2027</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-[#8b949e] hover:bg-[#0d1117] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sections — collapsible accordion */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {SECTIONS.map(({ id, icon: Icon, title, body }) => {
                const isOpen = openSection === id;
                return (
                  <div key={id} className="border-b border-[#30363d]">
                    <button
                      onClick={() => setOpenSection(isOpen ? null : id)}
                      className="w-full flex items-center gap-2.5 px-5 py-3 text-left hover:bg-[#161b22] transition-colors"
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isOpen ? "text-cyan-400" : "text-[#8b949e]"}`} />
                      <span className={`flex-1 text-xs font-semibold ${isOpen ? "text-cyan-400" : "text-[#c9d1d9]"}`}>{title}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-[#484f58] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs text-[#8b949e] leading-relaxed space-y-1">
                        {body}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#30363d] bg-[#161b22] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#484f58]">BOB-INIT-HANDBOOK-3.0 · The Pro-Architect Edition</span>
              <Button onClick={() => setOpen(false)} size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs">
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}