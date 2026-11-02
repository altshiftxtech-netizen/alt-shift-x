import React, { useRef, useState } from 'react';
import { Paperclip, Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
export default function UpkeeperReferenceUpload({reference,onChange,onBusy,disabled}) {
  const input=useRef(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const upload=async event=>{
    const file=event.target.files?.[0];if(!file)return;
    setError('');if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10*1024*1024){setError('Choose a PNG, JPG or WebP image under 10 MB.');return;}
    setBusy(true);onBusy(true);
    try {const {file_url}=await base44.integrations.Core.UploadPublicFile({file});onChange({url:file_url,name:file.name});}
    catch(e){setError(e.message);}finally{setBusy(false);onBusy(false);event.target.value='';}
  };
  return <div className="space-y-2">
    <input ref={input} type="file" aria-label="Reference image upload" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={upload}/>
    <Button type="button" variant="outline" disabled={disabled||busy} onClick={()=>input.current?.click()} aria-label="Upload reference image">{busy?<Loader2 className="animate-spin"/>:<Paperclip/>}Reference image</Button>
    {reference&&<div className="flex items-center gap-2 text-sm"><img className="h-10 w-10 object-contain rounded border" src={reference.url} alt="Uploaded reference"/><a className="underline truncate max-w-48" href={reference.url} target="_blank" rel="noreferrer">{reference.name}</a><Button type="button" variant="ghost" size="icon" disabled={disabled||busy} aria-label="Remove reference image" onClick={()=>onChange(null)}><X/></Button></div>}
    <p className="text-xs text-muted-foreground">Reference uploads (stored publicly — anyone with the link can open them)</p>
    {error&&<p role="alert" className="text-destructive text-sm">{error}</p>}
  </div>;
}