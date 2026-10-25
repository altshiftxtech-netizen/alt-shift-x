import React from 'react';
import { Lock } from 'lucide-react';
import { canInspectDelta } from '@/components/warehouse/deltaAccess';

export default function DeltaIpSection({ component, currentUser }) {
  return <section className="delta-ip-theme rounded-2xl bg-muted/60 border border-border p-4 mb-5" data-testid="delta-ip-section" data-unlocked={canInspectDelta(currentUser)}>
    {canInspectDelta(currentUser) ? <div className="space-y-2 text-xs font-mono break-words">
      <div className="flex flex-wrap justify-between gap-2 text-muted-foreground text-[10px] uppercase font-bold"><span>Output Schema:</span><span className="delta-success">Verified IP Unlocked</span></div>
      <div className="flex flex-wrap gap-1">{(component.schema || []).map((field, i) => <span key={i} className="rounded bg-secondary px-2 py-0.5 text-primary text-[10px] break-all">{field}</span>)}</div>
      {!component.schema?.length && <p className="text-muted-foreground">No schema fields supplied.</p>}
      {component.features?.[0] && <p className="text-foreground/80 pt-1">✓ {component.features[0]}</p>}
    </div> : <div className="relative min-h-28 flex items-center justify-center">
      <div aria-hidden="true" className="absolute inset-0 blur-sm select-none opacity-40 space-y-2 pointer-events-none"><div className="h-3 w-2/3 bg-secondary rounded" /><div className="flex gap-1"><div className="h-4 w-16 bg-secondary rounded" /><div className="h-4 w-20 bg-secondary rounded" /><div className="h-4 w-12 bg-secondary rounded" /></div><div className="h-3 w-4/5 bg-secondary rounded" /></div>
      <div className="relative text-center flex flex-col items-center gap-1"><Lock className="h-4 w-4 text-primary" /><span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-wider">Proprietary Architecture Protected</span><span className="text-[10px] text-muted-foreground">Log in with a Free Developer Account to inspect full schema &amp; netlists</span></div>
    </div>}
  </section>;
}