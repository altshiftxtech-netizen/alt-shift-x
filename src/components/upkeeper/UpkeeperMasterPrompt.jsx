import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import UpkeeperReferenceUpload from '@/components/upkeeper/UpkeeperReferenceUpload';
const chips=[['logo','🎨 Vibe Logo'],['reel','🎬 4K Reel'],['autopilot','🔗 HeyCatch Link'],['article','📄 Article']];
export default function UpkeeperMasterPrompt({assets,onPrompt,onPatch,onRun,busy,error,notice}) {
  const [uploading,setUploading]=useState(false);
  return <form className="creative-panel mb-4" aria-label="Master Prompt Dock" onSubmit={e=>{e.preventDefault();onRun();}}>
    <div><p className="creative-eyebrow">SYS-UPKEEPER-PROMPT-VIBECODE-REEL-ENGINES-1.0</p><h2>Master Prompt Dock</h2></div>
    <Textarea aria-label="Master prompt" rows={3} value={assets.prompt||''} disabled={busy} onChange={e=>onPrompt(e.target.value)} placeholder="Describe a brand logo to vibe-code, enter a reel topic, or paste a link for HeyCatch..."/>
    <div className="flex flex-wrap gap-2">{chips.map(([id,label])=><Button key={id} type="button" variant={assets.intent===id?'default':'outline'} disabled={busy||uploading} aria-pressed={assets.intent===id} onClick={()=>onPatch({intent:id,tab:id})}>{label}</Button>)}</div>
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3"><UpkeeperReferenceUpload reference={assets.reference} onChange={reference=>onPatch({reference})} onBusy={setUploading} disabled={busy}/><Button disabled={busy||uploading||!assets.prompt?.trim()} type="submit">{busy?'Running engine…':'⚡ Run Engine'}</Button></div>
    <p className="text-xs text-muted-foreground">New logo synthesis, reel scripts, articles and link research use AI credits. Live logo refinements and video recording run locally; videos are silent.</p>
    {busy&&<p role="status" className="text-sm">{notice||'Preparing your engine…'}</p>}{!busy&&notice&&<p role="status" className="text-sm">{notice}</p>}{error&&<p role="alert" className="text-destructive text-sm">{error}</p>}
  </form>;
}