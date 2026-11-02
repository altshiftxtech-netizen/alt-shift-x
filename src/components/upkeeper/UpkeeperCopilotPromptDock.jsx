import React,{useState} from 'react';
import {base44} from '@/api/base44Client';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {refineLogo,logoSchema} from '@/components/upkeeper/creativePrompt';
import {emblemPresets,emblemPreset,isProceduralEdit} from '@/components/upkeeper/emblemConversation';
import {safePaths} from '@/components/upkeeper/emblemGeometry';
import UpkeeperReferenceUpload from '@/components/upkeeper/UpkeeperReferenceUpload';
export default function UpkeeperCopilotPromptDock({assets,onPatch,disabled}) {
  const [input,setInput]=useState(''),[busy,setBusy]=useState(false),[uploading,setUploading]=useState(false),[error,setError]=useState('');
  const history=assets.logo.conversation||[];
  const preview=text=>{setInput(text);onPatch({logo:refineLogo(assets.logo,text),reel:null});};
  const submit=async event=>{event.preventDefault();if(!input.trim()||busy)return;setBusy(true);setError('');let logo=refineLogo(assets.logo,input),reply='Updated the existing layers. Keep refining the same emblem.';
    try {if(!isProceduralEdit(input)){const result=await base44.integrations.Core.InvokeLLM({prompt:`Refine an existing grouped SVG emblem with this request: ${input}. Existing settings and symbol paths: ${JSON.stringify({...logo,conversation:undefined})}. Preserve the current silhouette and unrelated details. Return closed SVG paths for a detailed character portrait or symbol in x100..412 y90..330. Do not include lettering in paths. Return at most 24 paths, each under 8000 characters. Keep the current monogram and material unless requested.`,file_urls:assets.reference?[assets.reference.url]:[],response_json_schema:logoSchema});const paths=safePaths(result.paths);if(!paths.length)throw new Error('No editable paths returned. Try describing the character in more detail.');logo={...logo,paths};reply='Custom vector details refined; your frame, props and wordmark are preserved.';}onPatch({logo:{...logo,conversation:[...history,{request:input,reply}].slice(-20)},reel:null});setInput('');}
    catch(e){setError(e.message);}finally{setBusy(false);}};
  return <form onSubmit={submit} className="creative-panel creative-prompt-panel emblem-copilot" aria-label="Emblem copilot">
    <div><h2>Emblem copilot</h2><p className="text-sm text-muted-foreground">Refine the same design, one message at a time.</p></div>
    <details className="creative-disclosure"><summary>Quick presets & conversation</summary><div className="grid grid-cols-2 gap-2 pt-3">{emblemPresets.map(([id,label])=><Button key={id} type="button" variant="outline" className="h-auto whitespace-normal text-xs" disabled={busy||disabled} onClick={()=>{onPatch({logo:emblemPreset(assets.logo,id),reel:null});setInput('');}}>{label}</Button>)}</div>
    <div className="emblem-conversation" aria-label="Emblem conversation" aria-live="polite">{history.length?history.map((turn,i)=><div key={i} className="space-y-1 border-b pb-3"><p className="text-sm font-medium">{turn.request}</p><p className="text-xs text-muted-foreground">{turn.reply}</p></div>):<p className="text-xs text-muted-foreground">Try “Make the crest wider” or “Give the character a cybernetic visor”.</p>}</div></details>
    <label className="text-sm font-medium" htmlFor="emblem-prompt">Describe your edit</label><Textarea id="emblem-prompt" aria-label="Emblem edit" rows={3} value={input} disabled={busy||disabled} onChange={e=>preview(e.target.value)} placeholder="Give it an athletic barbell stack with liquid chrome finish…"/>
    <Button type="submit" disabled={busy||disabled||uploading||!input.trim()}>{busy?'Refining emblem…':'Update Emblem'}</Button>
    <details className="creative-disclosure"><summary>Reference & generation info</summary><div className="pt-3 space-y-3"><UpkeeperReferenceUpload reference={assets.reference} onChange={reference=>onPatch({reference})} onBusy={setUploading} disabled={busy||disabled}/><p className="text-xs text-muted-foreground">Procedural tweaks preview locally. Custom character details use AI credits. Presets replace the composition; conversational edits preserve it.</p></div></details>
    {busy&&<p role="status" className="text-sm">Refining vector layers…</p>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
  </form>;
}