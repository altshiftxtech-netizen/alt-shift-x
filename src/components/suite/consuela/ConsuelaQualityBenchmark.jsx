import React, { useState } from 'react';
import { runQualityCrucible } from '@/components/suite/consuela/runQualityCrucible';
import ConsuelaBenchmarkResults from '@/components/suite/consuela/ConsuelaBenchmarkResults';
export default function ConsuelaQualityBenchmark() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const run = async () => {
    setRunning(true); setResult(null); setError('');
    try {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      setResult(await runQualityCrucible());
    } catch (error) { setError(error.message || 'The browser could not complete the benchmark. Please try again.'); }
    finally { setRunning(false); }
  };
  return <div className="space-y-4">
    <div className="p-4 rounded-2xl bg-secondary border border-border space-y-3">
      <h4 className="text-xs font-black uppercase text-primary font-mono">Live Client-Side Proving Ground</h4>
      <p className="text-xs text-muted-foreground leading-relaxed">Run a live browser test across <strong>Speed</strong>, <strong>Accuracy</strong>, and <strong>Consistency</strong>. Five concurrent passes generate and validate structured fixtures, reject invalid input, and compare computed Merkle hashes.</p>
      <button onClick={run} disabled={running} className="w-full p-3 rounded-xl font-black text-xs bg-primary text-primary-foreground disabled:opacity-50">{running ? 'Executing 5-Pass Deterministic Crucible...' : 'Run Live Quality Benchmark ($0.00 Tokens) →'}</button>
      {running && <p role="status" className="text-xs text-primary">Measuring local execution and verifying hashes...</p>}
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {result && <ConsuelaBenchmarkResults result={result} />}
    <p className="text-xs text-muted-foreground break-words font-mono">SYS-CONSUELA-MAGNA-QUALITY-CRUCIBLE-1.0</p>
  </div>;
}