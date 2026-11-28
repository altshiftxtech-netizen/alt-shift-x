import React from 'react';
import { Switch } from '@/components/ui/switch';
export default function WatermarkSettings({value,onChange,disabled}) {
  const patch=fields=>onChange({...value,...fields});
  return <fieldset disabled={disabled} className="dm-panel space-y-3">
    <div className="dm-label">Brand &amp; Export Settings</div>
    <div className="dm-row-between"><label htmlFor="dm-watermark">Alt+Shift+X Sovereign Watermark</label><Switch id="dm-watermark" checked={value.enabled} disabled={disabled} onCheckedChange={enabled=>patch({enabled})}/></div>
    {value.enabled && <><span role="status" className="dm-chip">✓ Brand Watermark: Enabled</span>
      <div className="flex flex-wrap gap-3">{[['Position','position',[['bottom-right','Bottom-Right (Standard Cinema)'],['top-right','Top-Right (Minimal Badge)'],['bottom-left','Bottom-Left (HUD Style)']]],['Opacity','opacity',[[0.3,'Subtle Glass (30%)'],[0.65,'Prismatic Crystal (65%)'],[0.9,'Solid Crest (90%)']]]].map(([label,key,items])=><label key={key} className="grid gap-1 text-sm">{label}<select className="rounded border p-2 bg-background text-foreground" value={value[key]} onChange={e=>patch({[key]:key==='opacity'?Number(e.target.value):e.target.value})}>{items.map(([v,title])=><option key={v} value={v}>{title}</option>)}</select></label>)}</div></>}
  </fieldset>;
}