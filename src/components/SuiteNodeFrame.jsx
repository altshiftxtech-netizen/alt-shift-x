import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Loader2, Lock } from "lucide-react";

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
 * Vanity endpoint: visiting /turimc, /codevault, etc. redirects to the
 * external site's home page. When top-level (published app), the redirect
 * is automatic. When framed (builder preview), the target site refuses
 * iframe embedding, so a launch button is shown instead.
 */
export default function SuiteNodeFrame({ nodeId: propNodeId }) {
  const params = useParams();
  const nodeId = propNodeId || params.nodeId;
  const node = useMemo(() => SUITE_NODES[nodeId], [nodeId]);
  const isFramed = typeof window !== "undefined" && window.self !== window.top;
  const [redirecting, setRedirecting] = useState(!isFramed);

  useEffect(() => {
    if (!node || isFramed) return;
    // Top-level: navigate directly so the URL bar reflects the vanity redirect.
    // Uses replace so the back button returns to Alt+Shift+X, not a loop.
    setRedirecting(true);
    window.location.replace(node.url);
  }, [node, isFramed]);

  if (!node) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#030306] text-white">
        <div className="text-center">
          <p className="text-2xl font-bold mb-2">Node not found</p>
          <p className="text-white/50 mb-6">The suite node &ldquo;{nodeId}&rdquo; does not exist.</p>
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

  // Framed (builder preview): the external site refuses iframe embedding, so
  // show a launch button the user clicks to open the node in a new tab.
  if (isFramed) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-[#030306] text-white gap-4 px-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
          style={{ background: `${node.color}22`, border: `1px solid ${node.color}55` }}
        >
          {node.icon}
        </div>
        <h2 className="text-2xl font-bold">{node.name}</h2>
        <p className="text-sm text-white/50 text-center max-w-sm">{node.category}</p>
        <div className="flex items-center gap-1.5 text-xs text-amber-400/80">
          <Lock className="w-3.5 h-3.5" />
          <span>This node opens in a new tab.</span>
        </div>
        <a
          href={node.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition shadow-lg mt-2"
          style={{ background: node.color, boxShadow: `0 4px 20px ${node.color}44` }}
        >
          <ExternalLink className="w-4 h-4" /> Launch {node.name}
        </a>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition mt-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Alt+Shift+X
        </Link>
      </div>
    );
  }

  // Top-level: brief splash while the redirect resolves
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-[#030306] text-white gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{ background: `${node.color}22`, border: `1px solid ${node.color}55` }}
      >
        {node.icon}
      </div>
      <div className="flex items-center gap-2 text-sm text-white/70">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Launching {node.name}&hellip;</span>
      </div>
      <p className="text-[11px] text-white/30">
        Redirecting to <span className="font-mono">{node.url.replace(/^https?:\/\//, "")}</span>
      </p>
    </div>
  );
}