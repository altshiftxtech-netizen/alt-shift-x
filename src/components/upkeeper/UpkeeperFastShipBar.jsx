import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {downloadAsset} from '@/components/upkeeper/creativeAssets';
import {exportCreativeBundle,socialCopy} from '@/components/upkeeper/creativeBundles';
export default function UpkeeperFastShipBar({assets,disabled}) {
  const [busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[error,setError]=useState(''),[manual,setManual]=useState('');
  const act=async kind=>{setBusy(true);setError('');setNotice('');setManual('');try {
    if(kind==='copy'){const text=socialCopy(assets);try{await navigator.clipboard.writeText(text);setNotice('All social copy copied.');}catch{setManual(text);setNotice('Select and copy your social copy below.');}}
    else if(kind==='reel'){downloadAsset(assets.reel.blob,'upkeeper-reel.'+assets.reel.extension);setNotice('Reel download ready.');}
    else {const count=await exportCreativeBundle(assets,kind==='logo');setNotice(`Package ready: ${count} files.`);}
  }catch(e){setError(e.message);}finally{setBusy(false);}};
  return <section className="creative-panel mt-4" aria-label="Unified Fast-Ship Action Bar"><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
    <Button variant="outline" disabled={disabled||busy||!socialCopy(assets)} onClick={()=>act('copy')}>📋 Copy All Social Copy</Button>
    <Button variant="outline" disabled={disabled||busy||!assets.reel} onClick={()=>act('reel')}>⬇️ Download Reel Video</Button>
    <Button variant="outline" disabled={disabled||busy} onClick={()=>act('logo')}>🎨 Download Logo Kit</Button>
    <Button disabled={disabled||busy} onClick={()=>act('all')}>📦 Package All</Button>
  </div>{notice&&<p role="status" data-testid="fast-ship-status">{notice}</p>}{manual&&<textarea aria-label="All social copy" readOnly className="w-full border rounded p-3 bg-background text-foreground" rows={5} value={manual} onFocus={e=>e.target.select()}/>}{error&&<p role="alert" className="text-destructive">{error}</p>}</section>;
}