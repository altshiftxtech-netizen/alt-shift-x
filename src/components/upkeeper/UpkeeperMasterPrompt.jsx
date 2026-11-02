import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import UpkeeperReferenceUpload from '@/components/upkeeper/UpkeeperReferenceUpload';

export default function UpkeeperMasterPrompt({assets,onPrompt,onPatch,onRun,busy,error,notice}) {
  const [uploading,setUploading]=useState(false);
  return <form className="creative-panel creative-prompt-panel" aria-label="Master Prompt Dock" onSubmit={e=>{e.preventDefault();onRun();}}>
    <div><h2>Your prompt</h2><p className="text-sm text-muted-foreground">Describe what to create or refine, or paste a product link.</p></div>
    <Textarea aria-label="Master prompt" rows={4} value={assets.prompt||''} disabled={busy} onChange={e=>onPrompt(e.target.value)} placeholder="Describe your idea…"/>
    <Button disabled={busy||uploading||!assets.prompt?.trim()} type="submit">{busy?'Running engine…':'Run Engine'}</Button>
    <details className="creative-disclosure"><summary>Reference & engine info{assets.reference?' · 1 attached':''}</summary><div className="space-y-3 pt-3"><UpkeeperReferenceUpload reference={assets.reference} onChange={reference=>onPatch({reference})} onBusy={setUploading} disabled={busy}/><p className="text-xs text-muted-foreground">New logo synthesis, reel scripts, articles and link research use AI credits. Live logo refinements and video recording run locally; videos are silent.</p></div></details>
    {busy&&<p role="status" className="text-sm">{notice||'Preparing your engine…'}</p>}{!busy&&notice&&<p role="status" className="text-sm">{notice}</p>}{error&&<p role="alert" className="text-destructive text-sm">{error}</p>}
  </form>;
}