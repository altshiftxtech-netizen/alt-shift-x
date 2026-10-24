import React from 'react';
import { PASS_NODES } from '@/components/suite/passes/passFoundryData';
export default function PassTierCard({ tier, selected, nodeId, secondNodeId, onSecondNode, busy, onActivate }) {
  return <article data-tier={tier.id} className={`pass-tier-card rounded-3xl p-5 sm:p-6 flex flex-col bg-card/95 border ${tier.popular || selected ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'}`}>
    <div className="mb-3"><span className="pass-tier-badge rounded-full bg-primary/10 px-2 py-1 text-[9px] font-black tracking-wider" data-tier={tier.id}>{tier.badge}</span></div>
    <h3 className="text-lg font-black mb-2">{tier.name}</h3><p className="text-xs text-muted-foreground mb-5 leading-relaxed">{tier.headline}</p>
    <div className="mb-5"><span className="text-3xl font-black font-mono">{tier.price}</span><span className="block text-[11px] text-muted-foreground mt-1">{tier.period}</span></div>
    <div className="rounded-xl bg-secondary/60 border border-border p-3 mb-4 text-xs leading-relaxed"><p className="font-bold text-primary mb-2">⚡ {tier.swaps}</p><p className="text-secondary-foreground">👥 {tier.seats}</p></div>
    <ul className="space-y-3 text-xs text-secondary-foreground mb-6">{tier.features.map(feature => <li key={feature} className="flex items-start gap-2 leading-relaxed"><span className="pass-success">✓</span><span>{feature}</span></li>)}</ul>
    {tier.id === 'duo' && <label className="block text-xs text-muted-foreground mb-4 mt-auto">Second Duo node<select aria-label="Second Duo node" value={secondNodeId} onChange={event => onSecondNode(event.target.value)} className="block w-full mt-2 rounded-lg bg-background border border-border p-2 text-foreground">{PASS_NODES.filter(node => node.id !== nodeId).map(node => <option key={node.id} value={node.id}>{node.name}</option>)}</select></label>}
    <button type="button" disabled={!!busy} onClick={() => onActivate(tier)} className={`mt-auto w-full rounded-xl py-3 px-2 text-xs font-bold transition-colors disabled:opacity-50 ${tier.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary hover:bg-accent text-foreground'}`}>{busy === tier.id ? 'Opening secure checkout…' : `${tier.cta} →`}</button>
  </article>;
}