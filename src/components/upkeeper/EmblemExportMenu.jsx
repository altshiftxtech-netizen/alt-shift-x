import React,{useState} from 'react';
import {Button} from '@/components/ui/button';
import {buildEmblemSvg} from '@/components/upkeeper/emblemSvg';
import {downloadAsset} from '@/components/upkeeper/creativeAssets';
export default function EmblemExportMenu({settings}) {
  const [busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[error,setError]=useState('');
  const exportFile=async kind=>{setBusy(true);setNotice('');setError('');try{
    const svg=buildEmblemSvg(settings,kind==='icon'?'icon':kind==='favicon'?'favicon':'vector');
    if(kind==='svg'){downloadAsset(new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n'+svg],{type:'image/svg+xml'}),'emblem.svg');setNotice('Structured vector SVG ready.');return;}
    const width=kind==='master'?7680:kind==='icon'?512:32,height=kind==='master'?4320:width;
    const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await image.decode();
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas rendering is unavailable.');
    ctx.imageSmoothingEnabled=kind!=='favicon';const side=kind==='master'?height:width;ctx.drawImage(image,(width-side)/2,0,side,side);
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('PNG export failed.')),'image/png'));
    downloadAsset(blob,`emblem-${kind}-${width}x${height}.png`);canvas.width=canvas.height=0;setNotice(`PNG ready · ${width}×${height}${kind==='master'?' · transparent background':''}.`);
  }catch(e){setError(e.message);}finally{setBusy(false);}};
  return <details className="creative-disclosure"><summary>Export emblem</summary><div className="grid sm:grid-cols-2 gap-2 pt-3">{[['svg','Clean Vector SVG'],['master','8K Master Transparent PNG'],['icon','512×512 Maskable PWA Icon'],['favicon','32×32 Circular Favicon']].map(([id,label])=><Button key={id} className="h-auto whitespace-normal" variant="outline" disabled={busy} onClick={()=>exportFile(id)}>{label}</Button>)}</div>{busy&&<p role="status" className="text-sm pt-3">Rendering export…</p>}{notice&&<p data-testid="emblem-export-status" role="status" className="text-sm pt-3">{notice}</p>}{error&&<p role="alert" className="text-destructive text-sm pt-3">{error}</p>}</details>;
}