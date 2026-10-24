import React, { useEffect, useRef, useState } from 'react';
import { PASS_NODES } from '@/components/suite/passes/passFoundryData';
export default function PassNodeSwapper({ nodeId, onChoose }) {
  const [swapping, setSwapping] = useState(false), timer = useRef(null);
  const node = PASS_NODES.find(item => item.id === nodeId) || PASS_NODES[2];
  useEffect(() => () => clearTimeout(timer.current), []);
  const choose = id => { clearTimeout(timer.current); setSwapping(true); timer.current = setTimeout(() => { onChoose(id); setSwapping(false); }, 300); };
  return <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-12" aria-label="Node swap simulator">
    <div className="rounded-3xl bg-card/90 border border-primary/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 mb-4"><div><span className="text-[10px] font-mono text-primary font-bold tracking-wider">INTERACTIVE FEATURE SHOWCASE</span><h2 className="text-lg font-black">The Dynamic Node-Swapper Simulator</h2></div><span className="pass-success text-[10px] font-mono rounded-full px-3 py-1 border border-primary/20 bg-primary/5">✓ Hot-Swaps Included at $0.00 Fee</span></div>
      <p className="text-xs text-secondary-foreground mb-4">Try any node below. Your selection becomes the starting node at checkout; this demo does not change live access.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">{PASS_NODES.map(item => <button key={item.id} type="button" aria-pressed={item.id === nodeId} aria-label={`Simulate ${item.name}`} onClick={() => choose(item.id)} className={`about-suite-node flex items-center gap-2 rounded-xl border p-3 text-left transition-colors min-w-0 ${item.id === nodeId ? 'border-primary bg-primary/10' : 'border-border bg-background/60 hover:border-primary/50'}`} data-node={item.id}><span className="text-lg" aria-hidden="true">{item.icon}</span><span className="min-w-0"><span className="block text-xs font-bold leading-snug">{item.name}</span><span className="block text-[10px] text-muted-foreground">{item.category}</span></span></button>)}</div>
      <div className="pass-node-status rounded-2xl bg-background/70 border border-border p-4 flex flex-wrap items-center justify-between gap-3" aria-busy={swapping}>
        <div aria-live="polite"><div className="text-[10px] text-muted-foreground font-mono">{swapping ? 'SWAPPING DEMO NODE…' : 'CURRENT DEMO ALLOCATION:'}</div><div className="font-black text-sm mt-1">{node.icon} <span data-testid="allocated-node">{node.name}</span><span className="text-[9px] ml-2 text-primary font-mono">{swapping ? 'Processing…' : 'Demo ready'}</span></div></div>
        <a href={node.route} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-xl">Launch Node →</a>
      </div>
    </div>
  </section>;
}