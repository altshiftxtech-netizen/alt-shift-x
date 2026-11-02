import React from 'react';
import UpkeeperHeyCatchAutopilot from '@/components/upkeeper/UpkeeperHeyCatchAutopilot';
import LogoSandbox from '@/components/upkeeper/LogoSandbox';
import ReelStudio from '@/components/upkeeper/ReelStudio';
import FastShipHub from '@/components/upkeeper/FastShipHub';
import '@/components/upkeeper/creativeDock.css';
const tabs=[['autopilot','🔗 HeyCatch Autopilot'],['logo','🎨 Vibe Logo Sandbox'],['reel','🎬 4K Reel Studio'],['ship','⚡ Fast-Ship Hub']];
export default function UpkeeperCreativeDock({assets,setAssets}) {
  const patch=value=>setAssets(previous=>({...previous,...value}));
  const onTab=tab=>patch({tab});
  return <div className="creative-dock w-full mb-6">
    <div role="tablist" aria-label="UpKeeper creative workspaces">{tabs.map(([id,label],index)=><button key={id} id={'creative-tab-'+id} role="tab" aria-selected={assets.tab===id} aria-controls={'creative-panel-'+id} tabIndex={assets.tab===id?0:-1} onClick={()=>onTab(id)} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?3:(index+(e.key==='ArrowRight'?1:3))%4;onTab(tabs[next][0]);document.getElementById('creative-tab-'+tabs[next][0])?.focus();}}}>{label}</button>)}</div>
    <div id={'creative-panel-'+assets.tab} role="tabpanel" aria-labelledby={'creative-tab-'+assets.tab}>
      <div hidden={assets.tab!=='autopilot'}><UpkeeperHeyCatchAutopilot campaign={assets.campaign} onCampaign={campaign=>patch({campaign,reel:null})} activeUrl={assets.url} onUrl={url=>patch({url})}/></div>
      {assets.tab==='logo' && <LogoSandbox settings={assets.logo} onChange={logo=>patch({logo,reel:null})}/>}
      {assets.tab==='reel' && <ReelStudio assets={assets} onTab={onTab} onReel={reel=>patch({reel})}/>}
      {assets.tab==='ship' && <FastShipHub assets={assets} onTab={onTab}/>}
    </div>
  </div>;
}