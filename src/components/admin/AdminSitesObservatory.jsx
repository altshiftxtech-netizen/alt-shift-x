import React, { useState, useMemo } from 'react';
import {
  Globe, Download, ExternalLink, Shield, Activity, DollarSign,
  TrendingUp, Monitor, Smartphone, Tablet, FileArchive, CheckCircle2
} from 'lucide-react';
import JSZip from 'jszip';

// Canonical Fleet Netlist (8 Nodes + TGF Hub)
const FLEET_NODES = [
  {
    id: 'root-0',
    nodeNumber: 0,
    name: 'Alt+Shift+X Sovereign Apex',
    subpath: '/',
    productionUrl: 'https://altshiftx.tech',
    devUrl: 'https://unlock-agent-flow.base44.app',
    role: 'Root Hub & Sales Proving Ground',
    mrr: '$42,500',
    tokensSaved: '$1.42M',
    latencyMs: 14,
    uptimePct: '99.99%',
  },
  {
    id: 'node-7',
    nodeNumber: 7,
    name: 'MAGNA Site Foundry & Coder',
    subpath: '/magna',
    productionUrl: 'https://altshiftx.tech/magna',
    devUrl: 'https://magna-webapp-and-coder.base44.app',
    role: 'Visual Studio & WebGPU Engine',
    mrr: '$78,200',
    tokensSaved: '$2.85M',
    latencyMs: 12,
    uptimePct: '100.00%',
  },
  {
    id: 'node-2',
    nodeNumber: 2,
    name: 'dbLive Sovereign Database',
    subpath: '/dblive',
    productionUrl: 'https://altshiftx.tech/dblive',
    devUrl: 'https://dblive-sovereign-database.base44.app',
    role: 'WORM Merkle Block Audit Ledger',
    mrr: '$34,000',
    tokensSaved: '$980K',
    latencyMs: 9,
    uptimePct: '100.00%',
  },
  {
    id: 'node-5',
    nodeNumber: 5,
    name: 'SourceBridge Substrate Network',
    subpath: '/sourcebridge',
    productionUrl: 'https://altshiftx.tech/sourcebridge',
    devUrl: 'https://sourcebridge-software-and-data-substrate-network.base44.app',
    role: 'Data Pipelines & Substrate Bus',
    mrr: '$56,400',
    tokensSaved: '$1.80M',
    latencyMs: 16,
    uptimePct: '99.98%',
  },
  {
    id: 'node-1',
    nodeNumber: 1,
    name: 'Code Vault Repository',
    subpath: '/codevault',
    productionUrl: 'https://altshiftx.tech/codevault',
    devUrl: 'https://code-vault-repository.base44.app',
    role: 'AST Bytecode & Git Enclave',
    mrr: '$19,500',
    tokensSaved: '$410K',
    latencyMs: 15,
    uptimePct: '99.95%',
  },
  {
    id: 'node-3',
    nodeNumber: 3,
    name: 'OmniBridge Sovereign CRM',
    subpath: '/omnibridge',
    productionUrl: 'https://altshiftx.tech/omnibridge',
    devUrl: 'https://smart-agent-flow-chubby.base44.app',
    role: 'Lead Pipeline & Sovereign Contacts',
    mrr: '$22,800',
    tokensSaved: '$320K',
    latencyMs: 18,
    uptimePct: '99.97%',
  },
  {
    id: 'node-4',
    nodeNumber: 4,
    name: 'Bitfolio Sovereign Showcase',
    subpath: '/bitfolio',
    productionUrl: 'https://altshiftx.tech/bitfolio',
    devUrl: 'https://bitfolio.base44.app',
    role: '3D Project Cards & Verification',
    mrr: '$16,200',
    tokensSaved: '$290K',
    latencyMs: 14,
    uptimePct: '100.00%',
  },
  {
    id: 'node-6',
    nodeNumber: 6,
    name: 'Turi MC x APPerdeen Compute',
    subpath: '/turimc',
    productionUrl: 'https://altshiftx.tech/turimc',
    devUrl: 'https://turi-mc.base44.app',
    role: 'AI Orchestration & Multi-Cloud',
    mrr: '$28,100',
    tokensSaved: '$430K',
    latencyMs: 17,
    uptimePct: '99.96%',
  },
  {
    id: 'satellite-tgf',
    nodeNumber: 8,
    name: 'Train Great Fitness (TGF Hub)',
    subpath: '/tgf',
    productionUrl: 'https://altshiftx.tech/tgf',
    devUrl: 'https://tgf-ai-carousel.base44.app',
    role: 'Magna3D Play Ground & Model Carousel',
    mrr: '$12,400',
    tokensSaved: '$210K',
    latencyMs: 11,
    uptimePct: '100.00%',
  },
];

export default function AdminSitesObservatory() {
  const [layoutMode, setLayoutMode] = useState('4-up'); // '1-up' | '2-up' | '4-up' | 'all-grid'
  const [selectedNodeId, setSelectedNodeId] = useState('root-0');
  const [deviceViewport, setDeviceViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState('');

  const visibleNodes = useMemo(() => {
    if (layoutMode === '1-up') return FLEET_NODES.filter((n) => n.id === selectedNodeId);
    if (layoutMode === '2-up') return FLEET_NODES.slice(0, 2);
    if (layoutMode === '4-up') return FLEET_NODES.slice(0, 4);
    return FLEET_NODES;
  }, [layoutMode, selectedNodeId]);

  const viewportWidthClass = {
    desktop: 'w-full',
    tablet: 'max-w-[768px] mx-auto',
    mobile: 'max-w-[375px] mx-auto',
  }[deviceViewport];

  // ==========================================================================
  // DEDICATED 1-TAKE JAY SITE COMPILER (Separate from PWA Engine)
  // Compiles standard static web distribution for Cloudflare Pages / Vercel / Nginx
  // ==========================================================================
  const compileSiteZip = async (node) => {
    setIsExporting(true);
    setExportFeedback(`Assembling 1-Take Jay web site zip for "${node.name}"...`);

    try {
      const zip = new JSZip();

      const bootSequenceJson = {
        protocol: "1-TAKE-JAY-SOVEREIGN-SITE-V2.0",
        code: `SITE-${node.id.toUpperCase()}-1.0`,
        name: node.name,
        node_number: node.nodeNumber,
        canonical_subpath: node.subpath,
        production_url: node.productionUrl,
        runtime_environment: "WebGPU/WASM Client Execution",
        cloud_tokens_cost: "$0.00",
        entry_point: "index.html",
        pwa_model_autoloader_bypassed: true,
        execution_mode: "pure_web_standard",
        chain_of_title: {
          beneficiary: "Magna Lorem Trust",
          conception: "A Magna Dev Creation",
          production: "An AltShiftX.tech Production (Trust AR LLC)",
        }
      };

      const payloadJson = {
        site_id: node.id,
        name: node.name,
        schema_version: "2026.1",
        routes: [
          { path: "/", title: "Home / Overview", type: "landing_page" },
          { path: "/about", title: "About & Compliance", type: "dossier" },
        ],
        features: [
          "1-Take Jay Zero-Prompt Web Distribution",
          "Clean Static HTML5 Mount (No PWA Model Autoloader)",
          "100% Client-Side at $0.00 Cloud Tokens"
        ]
      };

      const manifestJson = {
        name: node.name,
        short_name: node.name.split(" ")[0],
        start_url: node.subpath || "/",
        display: "browser", // Standard browser window, not PWA standalone
        background_color: "#020617",
        theme_color: "#020617",
      };

      const siteConfigJson = {
        node_id: node.id,
        node_number: node.nodeNumber,
        canonical_subpath: node.subpath,
        production_apex: `https://altshiftx.tech${node.subpath}`,
        dev_container: node.devUrl,
      };

      const cleanIndexHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${node.name}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-slate-950 text-white font-sans antialiased">
  <div id="root">
    <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at center, #0f172a, #020617); text-align: center; padding: 24px;">
      <h1 style="font-size: 28px; font-weight: 800; color: #ffffff; margin-bottom: 8px;">${node.name}</h1>
      <p style="font-size: 14px; color: #94a3b8; max-width: 500px; line-height: 1.6; margin-bottom: 24px;">
        1-Take Jay Pure Web Site Distribution. Mounts cleanly to any web server without PWA autoloader hijacking.
      </p>
      <a href="${node.productionUrl}" style="padding: 12px 28px; border-radius: 12px; background: linear-gradient(90deg, #f59e0b, #ea580c); color: #020617; font-weight: 800; font-size: 13px; text-decoration: none;">
        Launch Live Site
      </a>
    </div>
  </div>
  <script src="site.bundle.js"></script>
</body>
</html>`;

      const siteBundleJs = `// 1-Take Jay Site Runtime
console.log("[1-Take Jay Site] Loaded ${node.name} cleanly.");
window.__1TAKE_JAY_SITE_MANIFEST__ = ${JSON.stringify(bootSequenceJson)};`;

      const stylesCss = `/* Clean Presentation Stylesheet */
body { margin: 0; background-color: #020617; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }`;

      const readmeTxt = `========================================================================
1-TAKE JAY SITE DISTRIBUTION PACKAGE
Target: ${node.name} (${node.subpath})
========================================================================
This is a standard web application archive. Deploy directly to:
- Cloudflare Pages / Vercel / Netlify
- Nginx / Apache (/var/www/html)
- AWS S3 / CloudFront
Zero PWA autoloader model interference.
========================================================================`;

      zip.file('boot-sequence.json', JSON.stringify(bootSequenceJson, null, 2));
      zip.file('payload.json', JSON.stringify(payloadJson, null, 2));
      zip.file('manifest.json', JSON.stringify(manifestJson, null, 2));
      zip.file('site.config.json', JSON.stringify(siteConfigJson, null, 2));
      zip.file('index.html', cleanIndexHtml);
      zip.file('site.bundle.js', siteBundleJs);
      zip.file('styles.css', stylesCss);
      zip.file('README.txt', readmeTxt);

      const blob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `1TAKEJAY-SITE-${node.id.toUpperCase()}.zip`;
      a.click();
      URL.revokeObjectURL(downloadUrl);

      setExportFeedback(`✓ Site zip compiled successfully for "${node.name}"!`);
    } catch (err) {
      setExportFeedback(`Error compiling site zip: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white font-sans p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2 text-white">
            <Globe className="w-6 h-6 text-cyan-400" />
            Sites Fleet Observatory & 1-Take Jay Site Compiler
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dedicated site monitoring and web distribution center. Separate from the native PWA compiler.
          </p>
        </div>

        {/* Viewport and Layout Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setDeviceViewport('desktop')}
              className={`p-1.5 rounded-lg ${deviceViewport === 'desktop' ? 'bg-white/20' : 'text-slate-400'}`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceViewport('tablet')}
              className={`p-1.5 rounded-lg ${deviceViewport === 'tablet' ? 'bg-white/20' : 'text-slate-400'}`}
              title="Tablet (768px)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceViewport('mobile')}
              className={`p-1.5 rounded-lg ${deviceViewport === 'mobile' ? 'bg-white/20' : 'text-slate-400'}`}
              title="Mobile (375px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
            {['1-up', '2-up', '4-up', 'all-grid'].map((mode) => (
              <button
                key={mode}
                onClick={() => setLayoutMode(mode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                  layoutMode === mode ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Arbitrage & Edge Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-xs">
        <div className="p-4 rounded-2xl bg-slate-900 border border-white/10">
          <span className="text-slate-400 block mb-1">Fleet Gross MRR</span>
          <span className="text-2xl font-black text-white">$309,100</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-400/30">
          <span className="text-emerald-400 block mb-1">Cloud Token Arbitrage</span>
          <span className="text-2xl font-black text-emerald-400">$8.72M USD</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-400/30">
          <span className="text-cyan-300 block mb-1">Cloudflare Edge Proxy</span>
          <span className="text-2xl font-black text-white">14.1 ms</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-white/10">
          <span className="text-slate-400 block mb-1">Active Fleet Nodes</span>
          <span className="text-2xl font-black text-amber-300">9 Nodes</span>
        </div>
      </div>

      {/* Feedback Bar */}
      {exportFeedback && (
        <div className="mb-6 p-3 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-xs font-mono text-indigo-200">
          {exportFeedback}
        </div>
      )}

      {/* 1-Up Node Tabs */}
      {layoutMode === '1-up' && (
        <div className="flex gap-2 overflow-x-auto pb-4">
          {FLEET_NODES.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedNodeId(n.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                selectedNodeId === n.id ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-slate-300'
              }`}
            >
              {n.name}
            </button>
          ))}
        </div>
      )}

      {/* Viewport Grid */}
      <div
        className={`grid gap-6 ${
          layoutMode === '1-up'
            ? 'grid-cols-1'
            : layoutMode === '2-up'
            ? 'grid-cols-1 lg:grid-cols-2'
            : layoutMode === '4-up'
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {visibleNodes.map((node) => (
          <div
            key={node.id}
            className="rounded-3xl bg-slate-900 border border-white/10 overflow-hidden flex flex-col justify-between shadow-xl"
          >
            {/* Viewport Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/70">
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-2">
                  {node.name}
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-400/30">
                    {node.subpath}
                  </span>
                </h4>
                <span className="text-[10px] text-slate-400">{node.role}</span>
              </div>

              {/* 1-Take Jay Site Compiler Button */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => compileSiteZip(node)}
                  disabled={isExporting}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-[11px] font-black transition-all flex items-center gap-1 shadow-sm"
                  title="Compile clean 1-Take Jay web site zip"
                >
                  <Download className="w-3.5 h-3.5" /> Site Zip
                </button>
                <a
                  href={node.productionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Live Iframe Window */}
            <div className="relative w-full h-[360px] bg-slate-950 p-2 flex items-center justify-center overflow-hidden">
              <div className={`h-full transition-all duration-300 rounded-2xl overflow-hidden border border-white/10 ${viewportWidthClass}`}>
                <iframe
                  src={node.productionUrl}
                  title={node.name}
                  className="w-full h-full border-none bg-slate-900"
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </div>

            {/* Footer Telemetry */}
            <div className="p-3 border-t border-white/10 bg-slate-950/80 grid grid-cols-4 gap-2 text-center text-[10px] text-slate-400">
              <div>
                <span className="block font-mono text-white font-bold">{node.latencyMs} ms</span>
                <span>Latency</span>
              </div>
              <div>
                <span className="block font-mono text-emerald-400 font-bold">{node.uptimePct}</span>
                <span>Uptime</span>
              </div>
              <div>
                <span className="block font-mono text-amber-300 font-bold">{node.mrr}</span>
                <span>MRR</span>
              </div>
              <div>
                <span className="block font-mono text-cyan-300 font-bold">{node.tokensSaved}</span>
                <span>Token Savings</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}