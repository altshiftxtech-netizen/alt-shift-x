import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UpkeeperEmblemEngine from '@/components/upkeeper/UpkeeperEmblemEngine';
import EmblemExportMenu from '@/components/upkeeper/EmblemExportMenu';
import {emblemMaterials} from '@/components/upkeeper/emblemSvg';

export default function LogoSandbox({ settings, onChange }) {
  const update = patch => onChange({...settings,...patch});
  return <section className="creative-panel" aria-label="Vibe Logo Sandbox">
    <div><h2>Emblem & Character Foundry</h2><p className="text-muted-foreground text-sm">Five editable vector layers. One evolving design.</p></div>
    <label className="text-sm font-medium">Material<select aria-label="Emblem material" className="creative-select" value={settings.finish} onChange={e=>update({finish:e.target.value})}>{Object.entries(emblemMaterials).map(([id,m])=><option key={id} value={id}>{m.label}</option>)}</select></label>
    <div className="creative-logo-layout">
      <UpkeeperEmblemEngine settings={settings}/>
      <p className="text-xs text-muted-foreground">Frame · Character · Props · Wordmark · Specular filters</p>
      <details className="creative-disclosure"><summary>Logo settings</summary><div className="grid sm:grid-cols-2 gap-4 pt-4">
        <label className="block text-sm">Logo monogram<Input aria-label="Logo monogram" maxLength={6} value={settings.text} onChange={e=>update({text:e.target.value})}/></label>
        <label className="block text-sm">Bevel Depth · <output>{settings.bevel}px</output><input aria-label="Bevel Depth" className="w-full mt-3 accent-primary" type="range" min="0" max="10" step="0.1" value={settings.bevel} onChange={e=>update({bevel:Number(e.target.value)})}/></label>
        <label className="block text-sm">Frame<select aria-label="Emblem frame" className="creative-select" value={settings.frame||(settings.circle?'medal':'squircle')} onChange={e=>update({frame:e.target.value,circle:e.target.value==='medal'})}><option value="crest">Crest shield</option><option value="medal">Circular medal</option><option value="squircle">22.5% Squircle</option></select></label>
        <fieldset><legend className="text-sm mb-2">Geometry</legend><div className="flex flex-wrap gap-2"><Button variant={!settings.circle?'default':'outline'} aria-pressed={!settings.circle} onClick={()=>update({circle:false,frame:'squircle'})}>22.5% Squircle</Button><Button variant={settings.circle?'default':'outline'} aria-pressed={settings.circle} onClick={()=>update({circle:true,frame:'medal'})}>100% Circle</Button></div></fieldset>
        <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={settings.circuits} onChange={e=>update({circuits:e.target.checked})}/>Procedural Gold PCB Circuit Traces</label>
      </div></details>
    </div>
    <p className="text-xs text-muted-foreground">32×32 favicons omit small wordmarks when a symbol is present; monogram-only logos keep their initials. The 8K master uses 4× canvas scaling with high-quality anti-aliasing.</p><EmblemExportMenu settings={settings}/>
  </section>;
}