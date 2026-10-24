import React from 'react';
export default function ConsuelaBenchmarkResults({ result }) {
  const metrics = [
    ['SPEED (LATENCY)', `${result.speed_latency_ms.toFixed(2)}ms`, 'Measured local execution'],
    ['ACCURACY', `${result.accuracy_score_pct.toFixed(1)}%`, `${result.schemaViolations} fixture schema errors`],
    ['DRIFT / VARIANCE', `${result.consistency_drift_pct.toFixed(2)}%`, `${result.parallelPasses}-pass Merkle hash comparison`],
  ];
  return <div className="space-y-3" role="status" data-testid="consuela-benchmark-results">
    <p className="text-sm font-bold text-primary">Local fixture verification: {result.benchmark_verdict}</p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">{metrics.map(([title, value, detail]) => <div key={title} className="p-3 rounded-xl bg-background border border-primary/30">
      <div className="text-xs font-mono text-muted-foreground">{title}</div><div className="text-lg font-black text-primary font-mono mt-1">{value}</div><div className="text-xs text-muted-foreground mt-1">{detail}</div>
    </div>)}</div>
    <p className="text-xs text-muted-foreground">{result.fixtureCount} structured fixtures generated and validated; invalid input rejection checked in each pass. SHA-256 Merkle roots computed using browser cryptography.</p>
    <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-xs font-mono flex flex-wrap justify-between gap-2"><span>TOKEN COST FOR THIS TEST:</span><strong>$0.0000 (100% client-side JavaScript)</strong></div>
    <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">Verification details</summary><p className="mt-2 break-all">Run: {result.test_run_id}<br />Merkle root: {result.root}</p></details>
    <p className="text-xs text-muted-foreground">Reference only: 1,840ms cloud latency is an illustrative baseline, not measured here. This tests local fixtures, not AI accuracy, hallucination rates, TypeScript compilation, legal compliance, or production Magna performance.</p>
  </div>;
}