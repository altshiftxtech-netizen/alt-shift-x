import React from 'react';
const INVARIANTS = [
  ['WORM Integrity', 'Cryptographically verifiable hashes ensure data cannot be rewritten or erased by rogue actors.'],
  ['Chain of Title', 'Clean statutory provenance registered under The Trust of Casey Maheni Brown & Magna Lorem LLC.'],
  ['Deterministic Edge', 'Cloudflare edge reverse proxy ensures zero URL bleed, sub-12ms latency, and high DDoS resilience.'],
];
export default function AboutSuiteSecurity() {
  return <section className="p-6 sm:p-8 rounded-3xl bg-card border border-primary/40">
    <div className="text-primary font-mono text-xs mb-2">INTELLECTUAL PROPERTY & SECURITY INVARIANTS</div><h2 className="text-xl font-black mb-3">Enterprise Confidentiality & Trust Architecture</h2>
    <p className="text-xs sm:text-sm text-secondary-foreground leading-relaxed mb-6">All Alt+Shift+X components are governed by strict commercial provenance, cryptographic verification, and the Sensitive Intelligence Policy. Our underlying algorithms are shielded by client-side enclave sandboxing to ensure customer proprietary workflows remain 100% confidential.</p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{INVARIANTS.map(([title, description]) => <article key={title} className="p-4 bg-secondary rounded-2xl border border-border"><h3 className="text-primary font-bold text-sm mb-1">{title}</h3><p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p></article>)}</div>
  </section>;
}