import React from 'react';
const FEATURES = [
  ['⚡', 'The $0.00 Token Invariant', 'Legacy AI tools charge you every time your team types, clicks, or compiles. Alt+Shift+X utilizes client-side WASM and edge runtimes—delivering limitless throughput without monthly cloud token inflation.'],
  ['🔒', 'Air-Gapped Sovereign Data', 'Your source code, client records, and legal telemetry never enter shared third-party AI training lakes. All operations execute inside private, tamper-resistant enclaves.'],
  ['🏛️', 'Statutory Proof by Default', 'Every commit, audit log, and CRM event is cryptographically sealed in WORM append-only Merkle ledgers, fully compliant with judicial evidentiary rules (MRE 901/902).'],
];
export default function AboutSuiteOverview() {
  return <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{FEATURES.map(([icon, title, description]) => <article key={title} className="p-6 rounded-3xl bg-card border border-primary/30">
      <div className="text-2xl mb-2" aria-hidden="true">{icon}</div><h3 className="text-base font-bold mb-2">{title}</h3><p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </article>)}</div>
    <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/40">
      <h2 className="text-xl font-black mb-3">Why Alt+Shift+X is Different From Any Existing SaaS</h2>
      <p className="text-xs sm:text-sm text-secondary-foreground leading-relaxed mb-4">Traditional software vendors lock your data into proprietary silos, then charge escalating seat fees and API overages. Alt+Shift+X operates on a <strong>Foundry Ownership Model</strong>: you license hardened, production-certified architecture standards that deploy to your own custom domain (<code>altshiftx.tech/...</code>) with zero vendor lock-in.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">{[['100%', 'Client Execution'], ['<12ms', 'Edge Response'], ['8 Nodes', 'Unified SSO Mesh'], ['X1–X5', 'Execution Tiers']].map(([metric, label], i) => <div key={label} className="p-3 bg-background/40 rounded-xl border border-border"><div className={`about-suite-metric metric-${i} text-lg font-black font-mono`}>{metric}</div><div className="text-[10px] text-muted-foreground uppercase">{label}</div></div>)}</div>
    </section>
  </div>;
}