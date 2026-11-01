import React, { useState } from 'react';
import {
  Code2, Database, Users, Briefcase, Share2, Cpu,
  Sparkles, ExternalLink, Shield, X, ArrowRight, CheckCircle2
} from 'lucide-react';

// ============================================================================
// CANONICAL 7-NODE PUBLIC FLEET (ZERO BASE44 URLS — TGF STRICTLY EXCLUDED)
// ============================================================================
const SUITE_NODES = [
  {
    id: 'node-1',
    nodeNum: 'NODE 01',
    name: 'Code Vault',
    publicUrl: 'https://altshiftx.tech/codevault',
    accentColor: '#06B6D4',
    icon: Code2,
    tagline: 'Sovereign Git & WASM Repositories',
    summary: 'Immutable AST bytecode repository and encrypted revision enclave protecting developer logic with zero telemetry leakage.',
    metrics: { latency: '8ms', execution: 'Client WASM', cost: '$0.00 Tokens' },
    highlights: ['Zero-Leak Git Commits', 'Compiled WASM Enclave', 'Hardware-Isolated AST Trees'],
  },
  {
    id: 'node-2',
    nodeNum: 'NODE 02',
    name: 'dbLive',
    publicUrl: 'https://altshiftx.tech/dblive',
    accentColor: '#D97706',
    icon: Database,
    tagline: 'Append-Only WORM Merkle Database',
    summary: 'Tamper-evident, cryptographically sealed audit ledger recording verified proof-of-work across every build interval.',
    metrics: { latency: '11ms', execution: 'SHA-256 Merkle', cost: '$0.00 Tokens' },
    highlights: ['WORM Audit Sealing', 'Sub-15ms Commit Receipts', 'Cross-Suite Integrity Verification'],
  },
  {
    id: 'node-3',
    nodeNum: 'NODE 03',
    name: 'OmniBridge CRM',
    publicUrl: 'https://altshiftx.tech/omnibridge',
    accentColor: '#F43F5E',
    icon: Users,
    tagline: 'Executive Lead Pipeline & Enclave',
    summary: 'Client-encrypted lead pipeline and relationship intelligence executing entirely in private browser IndexedDB enclaves.',
    metrics: { latency: '9ms', execution: 'Encrypted IndexedDB', cost: '$0.00 Tokens' },
    highlights: ['Private Contact Vaults', 'Ref-Stabilized Pipeline', 'Zero Central Cloud Exposure'],
  },
  {
    id: 'node-4',
    nodeNum: 'NODE 04',
    name: 'Bitfolio Hub',
    publicUrl: 'https://altshiftx.tech/bitfolio',
    accentColor: '#6366F1',
    icon: Briefcase,
    tagline: '3D Project Cards & Verification Hub',
    summary: 'Interactive 3D project showcase cards and instant credential verification for senior architects and development teams.',
    metrics: { latency: '7ms', execution: 'WebGPU 3D', cost: '$0.00 Tokens' },
    highlights: ['3D Proof-of-Work Cards', 'One-Click JSON Exports', 'Instant Client Verification'],
  },
  {
    id: 'node-5',
    nodeNum: 'NODE 05',
    name: 'SourceBridge',
    publicUrl: 'https://altshiftx.tech/sourcebridge',
    accentColor: '#14B8A6',
    icon: Share2,
    tagline: 'Sovereign Data Substrate & API Bus',
    summary: 'Universal connective tissue coordinating disparate enterprise data streams with Linux-grade cryptographic isolation.',
    metrics: { latency: '12ms', execution: 'Client Substrate', cost: '$0.00 Tokens' },
    highlights: ['Sloppy Secret Linking', 'Prompt Quarantine Enclave', 'Decoy Anti-Scrape Protection'],
  },
  {
    id: 'node-6',
    nodeNum: 'NODE 06',
    name: 'Turi MC x APPerdeen',
    publicUrl: 'https://altshiftx.tech/turimc',
    accentColor: '#10B981',
    icon: Cpu,
    tagline: 'Extreme Compute & AI Orchestration',
    summary: 'Distributed client-side WebAssembly compute workers and resilient multi-environment execution at maximum silicon clock.',
    metrics: { latency: '6ms', execution: 'WASM Workers', cost: '$0.00 Tokens' },
    highlights: ['In-Browser Compute Grid', 'Ref-Stabilized Workspaces', 'Zero Cloud Server Overhead'],
  },
  {
    id: 'node-7',
    nodeNum: 'NODE 07',
    name: 'MAGNA Site Foundry',
    publicUrl: 'https://altshiftx.tech/magna',
    accentColor: '#D946EF',
    icon: Sparkles,
    tagline: 'Visual Web Canvas & 1-Take Jay Compiler',
    summary: 'Flagship visual engineering studio transpiling designs into memory-safe React and WASM in zero prompt iterations.',
    metrics: { latency: '10ms', execution: '1-Take Jay AST', cost: '$0.00 Tokens' },
    highlights: ['1-Take Jay Zero-Iterate', 'Dual-Horizon Pedagogy', 'Instant Live Port-to-URL'],
  },
];

export default function PublicSuiteNodeGrid() {
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <section className="w-full max-w-7xl mx-auto my-16 px-4 font-sans text-white">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-950/60 border border-cyan-400/30 text-cyan-300 mb-3 shadow-md">
          <Shield className="w-3.5 h-3.5" /> Unified Cloudflare Edge Network
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          The 7-Node Sovereign Federation
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
          Each node operates under its authoritative custom domain route with sub-15ms client latency and zero cloud token burn.
        </p>
      </div>

      {/* Node Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUITE_NODES.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.id}
              className="group relative rounded-3xl bg-slate-900/70 border border-white/10 hover:border-white/25 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle top edge glow */}
              <div
                className="absolute top-0 left-0 right-0 h-1 opacity-70 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: node.accentColor }}
              />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="p-2.5 rounded-2xl bg-white/5 border border-white/10"
                      style={{ color: node.accentColor }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-slate-400 block font-bold">
                        {node.nodeNum}
                      </span>
                      <h3 className="text-lg font-black text-white">{node.name}</h3>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-400/20">
                    {node.metrics.latency}
                  </span>
!                </div>

                <p className="text-xs font-semibold text-slate-200 mb-2">{node.tagline}</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{node.summary}</p>

                {/* Micro Highlights */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {node.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions: Safe in-modal preview & clean custom domain launch */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedNode(node)}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all text-center"
                >
                  Explore Node Specs
                </button>
                <a
                  href={node.publicUrl}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                  title={`Launch ${node.name}`}
                >
                  <span>Visit</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* ====================================================================
          READ-ONLY IN-MODAL SPEC & DEMO REEL (ZERO SCRAPABLE IFRAMES)
      ==================================================================== */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-white/20 p-6 sm:p-8 shadow-2xl overflow-hidden text-white">
            {/* Ambient Background Radial */}
            <div
              className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none -mr-16 -mt-16"
              style={{ backgroundColor: selectedNode.accentColor }}
            />

            {/* Close Button */}
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-mono font-bold text-slate-400">
                {selectedNode.nodeNum} SPECIFICATION
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono text-emerald-400">
                {selectedNode.metrics.latency} Edge RTT
              </span>
            </div>

            <h3 className="text-2xl font-black text-white mb-2">{selectedNode.name}</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">{selectedNode.summary}</p>

            {/* Telemetry Matrix Pill */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 font-mono text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Edge Latency</span>
                <span className="text-sm font-bold text-emerald-400">{selectedNode.metrics.latency}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Engine Model</span>
                <span className="text-sm font-bold text-cyan-300">{selectedNode.metrics.execution}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Cloud Toll</span>
                <span className="text-sm font-bold text-amber-300">{selectedNode.metrics.cost}</span>
              </div>
            </div>

            {/* Key Architectural Guarantees */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Operational Highlights
              </h4>
              <ul className="space-y-2">
                {selectedNode.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedNode(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition-all"
              >
                Close Spec Sheet
              </button>
              <a
                href={selectedNode.publicUrl}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-black shadow-lg hover:from-cyan-300 hover:to-blue-400 transition-all flex items-center justify-center gap-1.5"
              >
                Launch Workspace on {selectedNode.publicUrl.replace('https://', '')}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}