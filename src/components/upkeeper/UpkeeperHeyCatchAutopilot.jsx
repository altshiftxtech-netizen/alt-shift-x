import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Link2, Rocket } from 'lucide-react';
import HeyCatchCampaignResults from '@/components/upkeeper/HeyCatchCampaignResults';

export default function UpkeeperHeyCatchAutopilot({ campaign, onCampaign, activeUrl, onUrl, onResearch, researching=false }) {
  const [localUrl,setLocalUrl]=useState(''), [busy,setBusy]=useState(false), [localResult,setLocalResult]=useState(null);
  const url=activeUrl ?? localUrl, setUrl=onUrl || setLocalUrl, result=campaign ?? localResult, setResult=onCampaign || setLocalResult;
  const [error,setError]=useState(''), [notice,setNotice]=useState(''), [manualCopy,setManualCopy]=useState('');
  const launch = async event => {
    event.preventDefault(); if(onResearch){onResearch(url);return;} setBusy(true); setError(''); setNotice(''); setManualCopy(''); setResult(null);
    try {
      const response = await base44.functions.invoke('upkeeperHeyCatch',{url});
      if (response.data.error) throw new Error(response.data.error);
      setResult(response.data);
    } catch(e) { setError(e.response?.data?.error || e.message || 'Research could not finish.'); }
    finally { setBusy(false); }
  };
  const copy = async text => {
    try { await navigator.clipboard.writeText(text); setNotice('Copied to clipboard.'); setError(''); setManualCopy(''); }
    catch { setManualCopy(text); setError(''); setNotice('Automatic clipboard access was refused. Select the text below and copy it, or download the brief.'); }
  };
  return <section className="bg-background text-foreground border border-border rounded-2xl p-4 sm:p-6 space-y-5 w-full min-w-0" aria-label="HeyCatch customer autopilot">
    <div><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">HeyCatch · Drop your link</p><h2 className="text-2xl font-bold mt-1">Customer Autopilot</h2><p className="text-sm text-muted-foreground mt-2">Turn a public product link into an audience brief, sourced discussions, useful replies and a three-week action plan.</p></div>
    <form onSubmit={launch} className="flex flex-col sm:flex-row gap-3">
      <label className="flex-1 min-w-0"><span className="sr-only">Website or product link</span><Input type="url" required value={url} onChange={e=>setUrl(e.target.value)} placeholder="Paste any website or product link" disabled={busy||researching}/></label>
      <Button disabled={busy||researching} type="submit">{busy?<Loader2 className="w-4 h-4 mr-2 animate-spin"/>:<Rocket className="w-4 h-4 mr-2"/>}{busy?'Researching campaign…':'Launch Customer Autopilot'}</Button>
    </form>
    <p className="text-xs text-muted-foreground">$0.00 ad spend · AI research uses integration credits. Public web search cannot access private communities or guarantee real-time coverage.</p>
    {(busy||researching) && <div role="status" className="border rounded-xl p-4 text-sm">Researching the product, finding public discussions, drafting replies and preparing your calendar. This can take a minute.</div>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {manualCopy && <label className="block text-sm">Campaign text to copy<textarea aria-label="Campaign text to copy" readOnly value={manualCopy} onFocus={e=>e.target.select()} className="mt-2 w-full h-40 rounded-lg border bg-background text-foreground p-3 font-mono text-xs"/></label>}
    {result ? <HeyCatchCampaignResults result={result} onCopy={copy}/> : !busy && <div className="rounded-xl border border-dashed p-6 flex items-center gap-3 text-sm text-muted-foreground"><Link2 className="w-5 h-5 shrink-0"/>Paste a public HTTPS product page to start. Results stay available while switching workspace tabs; export before leaving this page.</div>}
  </section>;
}