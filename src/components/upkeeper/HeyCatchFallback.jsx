import React,{useEffect,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
export default function HeyCatchFallback({blocked,disabled,onSubmit}) {
  const [text,setText]=useState(''),details=useRef(null);
  useEffect(()=>{if(blocked&&details.current)details.current.open=true;},[blocked]);
  return <details ref={details} className="creative-disclosure rounded-xl border p-3"><summary>Website blocked? Paste product details</summary>
    <form className="space-y-3 pt-3" onSubmit={e=>{e.preventDefault();onSubmit(text.trim());}}>
      <p className="text-xs text-muted-foreground">If the page is private, blocked or unavailable, paste a public-safe product description instead. We use it as your supplied brief, not as verified website evidence. Public discussion research still uses sources.</p>
      <label className="block text-sm">Product description or copied page text<Textarea aria-label="Fallback product description" required minLength={40} maxLength={12000} rows={6} value={text} disabled={disabled} onChange={e=>setText(e.target.value)} placeholder="Describe the product, audience, benefits and available proof. Do not paste passwords or private customer data."/></label>
      <Button type="submit" disabled={disabled||text.trim().length<40}>Research from pasted details</Button>
    </form>
  </details>;
}