import React from 'react';
import { useSuiteComponent } from '@/components/suite/bridges/SuiteComponentProvider';
import useSuiteBridge from '@/components/suite/bridges/useSuiteBridge';

const BRIDGES = [
  ['codevault', 'Commit to Code Vault', 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/30'],
  ['dblive', 'Record in dbLive', 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'],
  ['bitfolio', 'Mint Bitfolio Card', 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border-violet-500/30'],
  ['magna', 'Open in MAGNA', 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'],
];
export default function SuiteIntegrationActionBar({ loading = false }) {
  const { payload, source } = useSuiteComponent();
  const { handleSuiteBridge, status, cancel } = useSuiteBridge(payload);
  const disabled = !payload || loading || status.state === 'pending';
  const tooltip = !payload ? 'Select or generate a component to bridge' : loading ? 'Loading selected component' : 'Bridge the current component';
  return <section aria-label="Suite Integration Action Bar" className="space-y-2">
    <div className="flex flex-wrap items-center gap-2 p-3 bg-neutral-900/80 border border-white/10 rounded-2xl font-mono text-xs">
      <span className="text-neutral-400 text-[11px] uppercase tracking-wider px-2">Suite Bridges:</span>
      {BRIDGES.map(([target, label, color]) => <span key={target} title={tooltip}>
        <button type="button" disabled={disabled} title={tooltip} onClick={() => handleSuiteBridge(target)} className={`px-2.5 py-1.5 border rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${color}`}>{label}</button>
      </span>)}
      <span className="text-neutral-400 px-2 break-words" data-testid="bridge-context">{payload ? `${source}: ${payload.name || payload.displayName || payload.code}` : tooltip}</span>
    </div>
    {status.message && <p role={status.state === 'error' ? 'alert' : 'status'} className="text-xs text-muted-foreground font-mono break-words">{status.message}</p>}
    {status.state === 'pending' && <button type="button" onClick={cancel} className="text-xs text-muted-foreground underline">Cancel bridge</button>}
  </section>;
}