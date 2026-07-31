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
      </>
    ),
  },
  {
    id: "guide",
    icon: BookOpen,
    title: "1. How to Build Your First App",
    body: (
      <>
        <p className="mb-2">Building an app used to take months. With B.O.B.Init, it takes a conversation.</p>
        <ul className="space-y-2">
          <li><strong className="text-cyan-400">Step 1 — The Vision (Chat-to-Code):</strong> Talk to BOB like a partner. Say, <em>"I want a secure app for sports agents that handles medical data and legal contracts."</em> BOB translates this into a "Manifest"—a list of technical parts needed for the job.</li>
          <li><strong className="text-cyan-400">Step 2 — Customizing Your Logic:</strong> You don't need to write <code className="text-amber-400">if/else</code> statements. Just tell BOB the "Rules of the House." (Example: <em>"If a player's health score drops below 70, alert the manager immediately."</em>)</li>
          <li><strong className="text-cyan-400">Step 3 — The Assembly:</strong> Click "Render." B.O.B.Init pulls the parts from the Unzipped Catalog, wraps them in a secure PWA shell, and gives you a download link.</li>
          <li><strong className="text-cyan-400">Step 4 — The Download:</strong> Go to your dashboard, click the "Rocket" icon, and the PWA installs on your phone or desktop in seconds. <strong>Zero App Store hassle.</strong></li>
        </ul>
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
          <li>☑ <strong className="text-cyan-400">PII Fragmentation:</strong> Automatically splits user data across 5 nodes (Impossible to Hack).</li>
          <li>☑ <strong className="text-cyan-400">D2D Sync:</strong> Active "Internet Bluetooth" file sharing.</li>
          <li>☑ <strong className="text-cyan-400">Blackstone Guardrails:</strong> Real-time legal liability shifting.</li>
          <li>☑ <strong className="text-cyan-400">Hippocrates Shield:</strong> HIPAA-compliant health data encryption.</li>
          <li>☑ <strong className="text-cyan-400">Self-Healing Shim:</strong> Auto-updates your app when APIs change.</li>
          <li>☑ <strong className="text-cyan-400">seL4 Isolation:</strong> Hardware-level separation of your app's "brain" from the internet.</li>
          <li>☑ <strong className="text-cyan-400">FPGA Boolean Gate:</strong> Ingress filtering that drops non-authorized traffic.</li>
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
    title: "4. Admin & Gating: The BOB Bridge",
    body: (
      <>
        <p className="mb-2"><strong className="text-amber-400">Admin Only (BOB-INIT-ADMIN-KEY required):</strong></p>
        <ul className="space-y-1.5">
          <li><strong className="text-cyan-400">BOB's Autonomy:</strong> BOB can self-update the B.O.B.Init engine. When you ask it to "Add a feature to the builder," it uses <code className="text-amber-400">createComponentSafe</code> to update <code className="text-amber-400">BOB-INIT-ENGINE-1.0</code> in real-time.</li>
          <li><strong className="text-cyan-400">Pipeline Gating:</strong> The Sovereign Restriction is enforced — only <strong>Betta Vested 100</strong> members can see the high-stakes "Enterprise Exclusive" components.</li>
        </ul>
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
              <span className="text-[10px] font-mono text-[#484f58]">BOB-INIT-HANDBOOK-1.0</span>
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