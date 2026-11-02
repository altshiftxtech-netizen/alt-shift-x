import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { customerFinderPresets } from '@/components/upkeeper/customerFinderPresets';

export default function CustomerFinderIngestion({mode,onMode,url,onUrl,text,onText,onSubmit,busy}) {
  return <form aria-label="Customer Finder ingestion" className="space-y-4" onSubmit={event=>{event.preventDefault();onSubmit();}}>
    <div role="group" aria-label="Product ingestion mode" className="grid grid-cols-2 rounded-xl border bg-muted p-1 gap-1">
      {[['website','🔗 Drop Web Link'],['prompt','✍️ Describe Product (Prompt)']].map(([value,label])=><Button key={value} type="button" aria-pressed={mode===value} variant={mode===value?'default':'ghost'} className="h-auto min-h-11 whitespace-normal px-2 py-3 text-xs sm:text-sm" disabled={busy} onClick={()=>onMode(value)}>{label}</Button>)}
    </div>
    {mode==='website'?<label className="block space-y-2 text-sm font-medium">Website or product URL<Input aria-label="Website or product URL" type="url" required value={url} onChange={e=>onUrl(e.target.value)} placeholder="Paste public website or product URL..." disabled={busy}/></label>:<>
      <label className="block space-y-2 text-sm font-medium">Product description<Textarea aria-label="Product description" rows={7} minLength={40} maxLength={12000} required value={text} onChange={e=>onText(e.target.value)} disabled={busy} placeholder="Describe what you sell, who it's for, and the main problem it solves (or paste your raw landing page copy / elevator pitch)..."/></label>
      <div className="flex flex-wrap gap-2" aria-label="Quick-fill product presets">{customerFinderPresets.map(preset=><Button key={preset.label} type="button" variant="outline" size="sm" className="h-auto whitespace-normal py-2" disabled={busy} onClick={()=>onText(preset.text)}>{preset.label}</Button>)}</div>
      <p className="text-xs text-muted-foreground">No website access needed. Presets are editable starting briefs, not independently verified product claims.</p>
    </>}
    <Button type="submit" disabled={busy||(mode==='website'?!url.trim():text.trim().length<40)}>{busy?'Finding opportunities…':'Launch Customer Finder'}</Button>
  </form>;
}