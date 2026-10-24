import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AboutSuiteWaves from '@/components/suite/about/AboutSuiteWaves';
import PassFoundryHeader from '@/components/suite/passes/PassFoundryHeader';
import { PASS_NODES } from '@/components/suite/passes/passFoundryData';
import '@/components/suite/about/aboutSuite.css';
import '@/components/suite/passes/passFoundry.css';
export default function PassCheckoutResult() {
  const [params] = useSearchParams(), sessionId = params.get('session_id');
  const [result, setResult] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const verify = useCallback(async () => {
    setLoading(true); setError('');
    try {
      if (!sessionId) throw new Error('No checkout reference was provided.');
      const response = await base44.functions.invoke('getPassCheckoutStatus', { sessionId });
      setResult(response.data);
    } catch (err) { setError(err.response?.data?.error || err.message || 'Payment verification is unavailable.'); }
    finally { setLoading(false); }
  }, [sessionId]);
  useEffect(() => { verify(); }, [verify]);
  return <div className="about-suite sovereign-pass about-suite-wave-surface min-h-screen bg-background text-foreground"><AboutSuiteWaves /><PassFoundryHeader /><section className="max-w-2xl mx-auto px-5 py-16 text-center">
    <h1 className="text-3xl font-black mb-5">{loading ? 'Verifying your payment…' : result?.pass ? `${result.pass.name} confirmed` : 'Pass checkout status'}</h1>
    {error && <p role="alert" className="text-sm mb-6">{error}</p>}
    {result?.pass ? <div className="rounded-3xl bg-card border border-primary/40 p-6 text-left mb-6"><p className="text-primary font-bold mb-4" role="status">{result.pass.testMode ? 'TEST payment recorded, not a live entitlement.' : 'Payment verified and pass recorded.'}</p><p className="text-sm mb-3">Status: {result.pass.status}</p><p className="text-sm mb-4">Current period ends: {result.pass.expiresAt ? new Date(result.pass.expiresAt).toLocaleString() : 'Awaiting billing period'}</p><p className="text-xs text-muted-foreground mb-3">Purchased node allocation. External-node sign-in follows each node’s access controls.</p><div className="flex flex-wrap gap-2">{result.pass.nodeIds.map(id => { const node = PASS_NODES.find(item => item.id === id); return node && <a key={id} href={node.route} className="rounded-xl border border-border bg-secondary p-3 text-xs font-bold">{node.name} →</a>; })}</div></div> : !loading && !error && <p role="status" className="text-muted-foreground mb-6">Payment is not yet confirmed. Check again after completing Stripe checkout.</p>}
    {!loading && !result?.pass && <button type="button" onClick={verify} className="rounded-xl bg-primary text-primary-foreground px-5 py-3 font-bold text-sm mr-3">Check payment again</button>}
    <Link to="/sovereignpass" className="inline-block text-primary text-sm underline mt-4">Return to Pass Foundry</Link>
  </section></div>;
}