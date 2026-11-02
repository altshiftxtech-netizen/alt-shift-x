import React from 'react';
import UpkeeperHeyCatchAutopilot from '@/components/upkeeper/UpkeeperHeyCatchAutopilot';
import UpkeeperLogoSandbox from '@/components/upkeeper/UpkeeperLogoSandbox';
import UpkeeperReelEngine from '@/components/upkeeper/UpkeeperReelEngine';
import FastShipHub from '@/components/upkeeper/FastShipHub';
import UpkeeperMasterPrompt from '@/components/upkeeper/UpkeeperMasterPrompt';
import UpkeeperCopilotPromptDock from '@/components/upkeeper/UpkeeperCopilotPromptDock';
import UpkeeperFastShipBar from '@/components/upkeeper/UpkeeperFastShipBar';
import UpkeeperArticleDraft from '@/components/upkeeper/UpkeeperArticleDraft';
import useUpkeeperEngines from '@/components/upkeeper/useUpkeeperEngines';
import '@/components/upkeeper/creativeDock.css';
const tabs=[['autopilot','Customer Finder Autopilot'],['logo','Vibe Logo Sandbox'],['reel','4K Reel Studio'],['article','Article'],['ship','Fast-Ship Hub']];
export default function UpkeeperCreativeDock({assets,setAssets}) {
  const engine=useUpkeeperEngines(assets,setAssets),{patch,busy}=engine;
  const onTab=tab=>patch({tab,...(tab!=='ship'?{intent:tab}:{})});
  return <div className="creative-dock w-full mb-6">
    <div className="creative-workspace-header"><h2>Creative workspace</h2><label className="creative-workspace-picker">Workspace<select aria-label="Creative workspace" className="creative-select" value={assets.tab} disabled={busy} onChange={e=>onTab(e.target.value)}>{tabs.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label></div>
    <div className="creative-workspace-layout">
    {assets.tab==='logo'?<UpkeeperCopilotPromptDock assets={assets} onPatch={patch} disabled={busy}/>:<UpkeeperMasterPrompt assets={assets} onPrompt={engine.changePrompt} onPatch={patch} onRun={engine.run} busy={busy} error={engine.error} notice={engine.notice}/>}
    <div id={'creative-panel-'+assets.tab} className="creative-workspace-canvas" role="region" aria-label={tabs.find(([id])=>id===assets.tab)?.[1]}>
      <div hidden={assets.tab!=='autopilot'}><UpkeeperHeyCatchAutopilot compact campaign={assets.campaign} onCampaign={campaign=>patch({campaign,reel:null})} activeUrl={assets.url} onUrl={url=>patch({url})} onResearch={engine.run} researchError={engine.error} researching={busy&&assets.tab==='autopilot'}/></div>
      {assets.tab==='logo' && <UpkeeperLogoSandbox settings={assets.logo} onChange={logo=>patch({logo,reel:null})}/>}
      {assets.tab==='reel' && <UpkeeperReelEngine assets={assets} onPatch={patch} disabled={busy} onTab={onTab} onReel={reel=>patch({reel})} onBusy={value=>{engine.setBusy(value);if(!value)patch({reelRequest:null});}}/>}
      {assets.tab==='article' && <UpkeeperArticleDraft article={assets.article}/>}
      {assets.tab==='ship' && <FastShipHub assets={{...assets,campaign:assets.reelCampaign||assets.campaign}} onTab={onTab}/>}
    </div>
    </div>
    <UpkeeperFastShipBar assets={assets} disabled={busy}/>
  </div>;
}