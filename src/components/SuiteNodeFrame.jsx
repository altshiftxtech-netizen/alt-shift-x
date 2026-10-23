import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";

const SUITE_NODES = {
  turimc: {
    name: "Turi MC x APPerdeen",
    category: "Extreme Compute & Hardware Proving Ground",
    url: "https://turi-mc.base44.app",
    icon: "⚙️",
    color: "#10B981",
  },
  codevault: {
    name: "Code Vault",
    category: "Sovereign Git & WASM Repositories",
    url: "https://code-vault-repository.base44.app",
    icon: "📦",
    color: "#06B6D4",
  },
  dblive: {
    name: "dbLive Database",
    category: "Sovereign Immutable WORM Database",
    url: "https://dblive-sovereign-database.base44.app",
    icon: "🛡️",
    color: "#F59E0B",
  },
  omnibridge: {
    name: "OmniBridge CRM",
    category: "Executive Pipeline & CRM",
    url: "https://smart-agent-flow-chubby.base44.app",
    icon: "💼",
    color: "#F43F5E",
  },
  bitfolio: {
    name: "Bitfolio Hub",
    category: "3D Portfolio & Digital Cards",
    url: "https://bitfolio.base44.app",
    icon: "💳",
    color: "#6366F1",
  },
  sourcebridge: {
    name: "SourceBridge",
    category: "Universal API Substrate & Network",
    url: "https://sourcebridge-software-and-data-substrate-network.base44.app",
    icon: "🌐",
    color: "#14B8A6",
  },
  magna: {
    name: "MAGNA Builder",
    category: "Visual Canvas & Site Foundry",
    url: "https://magna-webapp-and-coder.base44.app",
    icon: "🎨",
    color: "#EC4899",
  },
};

/**
 * SuiteNodeFrame
 * Full-screen iframe viewport that mounts a Sovereign Enterprise Suite node
 * under its subpath (e.g. /turimc, /codevault). The frame runs with sandbox
 * and camera/microphone permissions enabled so embedded apps can use their
 * native capabilities.
 */
export default function SuiteNodeFrame({ nodeId: propNodeId }) {
  const params = useParams();
  const nodeId = propNodeId || params.nodeId;
  const node = useMemo(() => SUITE_NODES[nodeId], [nodeId]);

  if (!node) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#030306] text-white">
        <div className="text-center">
          <p className="text-2xl font-bold mb-2">Node not found</p>
          <p className="text-white/50 mb-6">The suite node "{nodeId}" does not exist.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Alt+Shift+X
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[#030306]" style={{ height: "calc(100vh - 64px)" }}>
      {/* Node header bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{node.icon}</span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-white">{node.name}</span>
            <span className="text-[10px] text-white/50">{node.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-full">
            <ShieldCheck className="w-3 h-3" /> SOVEREIGN NODE
          </span>
          <a
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open standalone
          </a>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Exit
          </Link>
        </div>
      </div>

      {/* Iframe viewport */}
      <iframe
        src={node.url}
        title={node.name}
        className="w-full h-full border-0"
        style={{ paddingTop: "49px" }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-modals allow-downloads"
        allow="camera; microphone; geolocation; clipboard-read; clipboard-write; fullscreen; autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}