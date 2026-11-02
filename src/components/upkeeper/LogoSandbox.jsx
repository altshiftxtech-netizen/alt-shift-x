import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { logoSvg, logoPng, downloadAsset } from '@/components/upkeeper/creativeAssets';

export default function LogoSandbox({ settings, onChange }) {
  const [error,setError] = useState(''), [busy,setBusy] = useState(false);
  const update = patch => onChange({...settings,...patch});
  const exportLogo = async size => {
    setBusy(true); setError('');
    try { downloadAsset(size ? await logoPng(settings,size) : new Blob([logoSvg(settings)],{type:'image/svg+xml'}),size?`logo-${size}.png`:'logo.svg'); }
    catch(e) { setError(e.message); } finally { setBusy(false); }
  };
  return <section className="creative-panel" aria-label="Vibe Logo Sandbox">
    <div><h2>Vibe Logo Sandbox</h2><p className="text-muted-foreground text-sm">Type refinements beside the canvas to see changes live.</p></div>
    <div className="creative-logo-layout">
      <div className="rounded-2xl border bg-secondary p-6 flex flex-col items-center justify-center gap-4">
        <div data-testid="logo-preview" className="w-full max-w-72" dangerouslySetInnerHTML={{__html:logoSvg(settings)}} />
        <div className="rounded-xl border bg-background w-full p-4"><p className="text-xs text-muted-foreground">LIVE SITE BRAND PREVIEW</p><strong>{settings.text || 'Your brand'} · Built to stand apart.</strong></div>
      </div>
      <details className="creative-disclosure"><summary>Logo settings</summary><div className="grid sm:grid-cols-2 gap-4 pt-4">
        <label className="block text-sm">Logo monogram<Input aria-label="Logo monogram" maxLength={6} value={settings.text} onChange={e=>update({text:e.target.value})}/></label>
        <label className="block text-sm">Bevel Depth · <output>{settings.bevel}px</output><input aria-label="Bevel Depth" className="w-full mt-3 accent-primary" type="range" min="0" max="10" step="0.1" value={settings.bevel} onChange={e=>update({bevel:Number(e.target.value)})}/></label>
        <label className="block text-sm">Metallic Finish<select aria-label="Metallic Finish" className="creative-select" value={settings.finish} onChange={e=>update({finish:e.target.value})}><option value="chrome">Liquid Chrome</option><option value="obsidian">Obsidian Dark</option><option value="gold">24K Gold</option><option value="platinum">Platinum Specular</option></select></label>
        <fieldset><legend className="text-sm mb-2">Geometry</legend><div className="flex flex-wrap gap-2"><Button variant={!settings.circle?'default':'outline'} aria-pressed={!settings.circle} onClick={()=>update({circle:false})}>22.5% Squircle</Button><Button variant={settings.circle?'default':'outline'} aria-pressed={settings.circle} onClick={()=>update({circle:true})}>100% Circle</Button></div></fieldset>
        <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={settings.circuits} onChange={e=>update({circuits:e.target.checked})}/>Procedural Gold PCB Circuit Traces</label>
      </div></details>
    </div>
    <details className="creative-disclosure"><summary>Individual logo downloads</summary><div className="flex gap-2 flex-wrap pt-3"><Button disabled={busy} onClick={()=>exportLogo(0)}>SVG Vector</Button><Button disabled={busy} variant="outline" onClick={()=>exportLogo(512)}>512×512 PWA Icon</Button><Button disabled={busy} variant="outline" onClick={()=>exportLogo(32)}>32×32 Favicon</Button></div></details>
    {error && <p role="alert" className="text-destructive">{error}</p>}
  </section>;
}