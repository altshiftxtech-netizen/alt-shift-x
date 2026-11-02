import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import CustomerFinderIngestion from '@/components/upkeeper/CustomerFinderIngestion';
import HeyCatchCampaignResults from '@/components/upkeeper/HeyCatchCampaignResults';

export default function UpkeeperCustomerFinder({campaign,onCampaign,activeUrl,onUrl,onResearch,researchError='',researching=false}) {
  const [mode,setMode]=useState('website'),[text,setText]=useState(''),[localUrl,setLocalUrl]=useState(''),[localResult,setLocalResult]=useState(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[manualCopy,setManualCopy]=useState('');
  const url=activeUrl??localUrl,setUrl=onUrl||setLocalUrl,result=campaign??localResult,setResult=onCampaign||setLocalResult,loading=busy||researching;
  const research=async()=>{
    setError('');setNotice('');setManualCopy('');
    const request=mode==='prompt'?{url:'',productText:text.trim()}:{url,productText:''};
    if(onResearch){await onResearch(mode==='prompt'?request:url);return;}
    setBusy(true);
    try{const {data}=await base44.functions.invoke('upkeeperHeyCatch',request);if(data.error)throw new Error(data.error);setResult(data);}
    catch(e){setError(e.response?.data?.error||e.message||'Customer Finder could not finish.');}finally{setBusy(false);}
  };
  const copy=async value=>{
    try{await navigator.clipboard.writeText(value);setNotice('Copied to clipboard.');setManualCopy('');}
    catch{setManualCopy(value);setNotice('Clipboard access was refused. Select and copy the text below.');}
  };
  return <section className="bg-background text-foreground border border-border rounded-2xl p-4 sm:p-6 space-y-5 w-full min-w-0" aria-label="Customer Finder">
    <div><h2 className="text-2xl font-bold">Customer Finder</h2><p className="text-sm text-muted-foreground mt-2">One buyer profile, buying-signal research and a 21-day growth sprint, from a public link or your own product description.</p></div>
    <CustomerFinderIngestion mode={mode} onMode={setMode} url={url} onUrl={setUrl} text={text} onText={setText} onSubmit={research} busy={loading}/>
    <p className="text-xs text-muted-foreground">$0 ad spend · AI research uses integration credits. Public search cannot access private communities or guarantee current coverage.</p>
    {loading&&<p role="status" className="rounded-xl border p-4 text-sm">Normalizing your buyer profile, finding sourced discussions and preparing 21 daily actions…</p>}
    {(error||researchError)&&<div role="alert" className="space-y-2"><p className="text-destructive">{error||researchError}</p>{mode==='website'&&<Button variant="outline" disabled={loading} onClick={()=>setMode('prompt')}>Describe the product instead</Button>}</div>}
    {notice&&<p role="status">{notice}</p>}
    {manualCopy&&<label className="block text-sm">Campaign text to copy<textarea aria-label="Campaign text to copy" readOnly value={manualCopy} onFocus={e=>e.target.select()} className="mt-2 w-full h-40 rounded-lg border bg-background text-foreground p-3 font-mono text-xs"/></label>}
    {!loading&&(result?<HeyCatchCampaignResults result={result} onCopy={copy}/>:<div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">Choose an input mode to generate Buying-Signal Radar, Value-First Ghost Replies and your 3-Week Sprint Roadmap. Results stay available when switching workspaces; export before leaving this page.</div>)}
  </section>;
}