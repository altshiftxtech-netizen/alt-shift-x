import React from 'react';
import UpkeeperHeyCatchAutopilot from '@/components/upkeeper/UpkeeperHeyCatchAutopilot';
import UpkeeperLogoSandbox from '@/components/upkeeper/UpkeeperLogoSandbox';
import UpkeeperReelEngine from '@/components/upkeeper/UpkeeperReelEngine';
import FastShipHub from '@/components/upkeeper/FastShipHub';
import UpkeeperMasterPrompt from '@/components/upkeeper/UpkeeperMasterPrompt';
import UpkeeperFastShipBar from '@/components/upkeeper/UpkeeperFastShipBar';
import UpkeeperArticleDraft from '@/components/upkeeper/UpkeeperArticleDraft';
import useUpkeeperEngines from '@/components/upkeeper/useUpkeeperEngines';
import '@/components/upkeeper/creativeDock.css';
const tabs=[['autopilot','🔗 HeyCatch Autopilot'],['logo','🎨 Vibe Logo Sandbox'],['reel','🎬 4K Reel Studio'],['article','📄 Article'],['ship','⚡ Fast-Ship Hub']];
export default function UpkeeperCreativeDock({assets,setAssets}) {
  const engine=useUpkeeperEngines(assets,setAssets),{patch,busy}=engine;
  const onTab=tab=>patch({tab});
  return <div className="creative-dock w-full mb-6">
    <UpkeeperMasterPrompt assets={assets} onPrompt={engine.changePrompt} onPatch={patch} onRun={engine.run} busy={busy} error={engine.error} notice={engine.notice}/>
    <div role="tablist" aria-label="UpKeeper creative workspaces">{tabs.map(([id,label],index)=><button disabled={busy} key={id} id={'creative-tab-'+id} role="tab" aria-selected={assets.tab===id} aria-controls={'creative-panel-'+id} tabIndex={assets.tab===id?0:-1} onClick={()=>onTab(id)} onKeyDown={e=>{if(!busy&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length;onTab(tabs[next][0]);document.getElementById('creative-tab-'+tabs[next][0])?.focus();}}}>{label}</button>)}</div>
    <div id={'creative-panel-'+assets.tab} role="tabpanel" aria-labelledby={'creative-tab-'+assets.tab}>
      <div hidden={assets.tab!=='autopilot'}><UpkeeperHeyCatchAutopilot campaign={assets.campaign} onCampaign={campaign=>patch({campaign,reel:null})} activeUrl={assets.url} onUrl={url=>patch({url})} onResearch={engine.run} researching={busy&&assets.tab==='autopilot'}/></div>
      {assets.tab==='logo' && <UpkeeperLogoSandbox settings={assets.logo} onChange={logo=>patch({logo,reel:null})}/>}
      {assets.tab==='reel' && <UpkeeperReelEngine assets={assets} onTab={onTab} onReel={reel=>patch({reel})} onBusy={value=>{engine.setBusy(value);if(!value)patch({reelRequest:null});}}/>}
      {assets.tab==='article' && <UpkeeperArticleDraft article={assets.article}/>}
      {assets.tab==='ship' && <FastShipHub assets={{...assets,campaign:assets.reelCampaign||assets.campaign}} onTab={onTab}/>}
    </div>
    <UpkeeperFastShipBar assets={assets} disabled={busy}/>
  </div>;
}