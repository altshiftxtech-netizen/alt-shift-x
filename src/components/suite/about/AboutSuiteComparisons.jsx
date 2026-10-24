import React from 'react';
import { COMPARISONS } from '@/components/suite/about/aboutSuiteData';
export default function AboutSuiteComparisons() {
  return <div className="overflow-x-auto rounded-3xl border border-primary/30 bg-card" tabIndex={0} role="region" aria-label="Sovereign suite comparison table">
    <table className="w-full min-w-[600px] text-left text-xs"><thead className="bg-primary/10 text-primary border-b border-primary/20 font-mono"><tr><th scope="col" className="p-4">CAPABILITY / ARCHITECTURE</th><th scope="col" className="p-4">LEGACY CLOUD SAAS</th><th scope="col" className="p-4 text-foreground bg-primary/20">ALTSHIFTX SOVEREIGN SUITE</th></tr></thead>
      <tbody className="divide-y divide-border text-secondary-foreground">{COMPARISONS.map(([capability, legacy, sovereign]) => <tr key={capability}><th scope="row" className="p-4 font-bold text-foreground">{capability}</th><td className="about-suite-legacy p-4">{legacy}</td><td className="about-suite-win p-4 bg-primary/5 font-semibold">{sovereign}</td></tr>)}</tbody>
    </table>
  </div>;
}