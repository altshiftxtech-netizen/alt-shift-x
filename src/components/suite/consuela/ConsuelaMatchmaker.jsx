import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { matchConsuela } from '@/components/suite/consuela/consuelaMatch';
export default function ConsuelaMatchmaker({ nodes }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const analyze = async event => {
    event.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true); setRecommendation(null);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    setRecommendation(matchConsuela(query, nodes)); setLoading(false);
  };
  return <div className="space-y-4">
    <p className="text-sm text-muted-foreground">Tell me about your tech stack, compliance mandates, or engineering volume. I will recommend suite nodes and a Sovereign Pass for your team.</p>
    <form onSubmit={analyze} className="space-y-3">
      <label htmlFor="consuela-project" className="sr-only">Describe your architecture</label>
      <textarea id="consuela-project" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. We need an immutable WORM database for court-grade compliance logs and Git repositories..." rows={3} className="w-full bg-background border border-border focus:border-primary rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none" />
      <button disabled={loading || !query.trim()} className="w-full py-3 rounded-xl font-bold text-xs bg-primary text-primary-foreground disabled:opacity-50">{loading ? 'Consuela is diagnosing your architecture...' : 'Analyze Architecture & Prescribe Node →'}</button>
    </form>
    <p className="text-xs text-muted-foreground">Local keyword-based matching. No AI service calls or cloud token charges.</p>
    {recommendation && <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 space-y-3" role="status">
      <div className="text-xs font-mono text-primary font-bold">RECOMMENDED PLATFORM{recommendation.nodes.length > 1 ? 'S' : ''}: {recommendation.nodes.map(n => n.name).join(' + ')}</div>
      <p className="text-xs text-foreground">{recommendation.reason}</p>
      <p className="text-xs text-muted-foreground">Optimal Entitlement: <strong className="text-foreground">{recommendation.pass}</strong></p>
      <div className="flex flex-wrap gap-2">{recommendation.nodes.map(node => <a key={node.id} href={node.subpath} className="flex-1 min-w-32 text-center p-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs">Launch {node.name} →</a>)}
        <Link to="/sovereignpass" className="flex-1 min-w-32 text-center p-3 rounded-xl bg-accent text-foreground font-bold text-xs">View Sovereign Passes</Link>
      </div>
    </div>}
  </div>;
}