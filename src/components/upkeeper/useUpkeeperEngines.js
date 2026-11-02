import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { promptIntent,promptUrl,refineLogo,logoSchema,reelSchema } from '@/components/upkeeper/creativePrompt';
export default function useUpkeeperEngines(assets,setAssets) {
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const patch=value=>setAssets(previous=>({...previous,...value}));
  const changePrompt=prompt=>setAssets(previous=>({...previous,prompt,...(previous.tab==='logo'?{logo:refineLogo(previous.logo,prompt),reel:null}:{})}));
  const run=async override=>{
    if(busy)return;
    const prompt=typeof override==='string'?override:assets.prompt||'',intent=promptIntent(prompt,typeof override==='string'?'autopilot':assets.intent);
    if(!prompt.trim())return;
    setBusy(true);setError('');setNotice('Preparing '+intent+' engine…');patch({tab:intent});
    try {
      if(intent==='autopilot'){
        const url=promptUrl(prompt);if(!url)throw new Error('Paste a public HTTPS product link in the master prompt.');patch({url});
        const {data}=await base44.functions.invoke('upkeeperHeyCatch',{url});if(data.error)throw new Error(data.error);patch({campaign:data,reelCampaign:null,reel:null});setNotice('Customer research and social copy ready.');
      }else if(intent==='logo'){
        const result=await base44.integrations.Core.InvokeLLM({prompt:`Design a logo as editable vector parameters. Request: ${prompt}. Current settings: ${JSON.stringify(assets.logo)}. Honor attached reference silhouette if present. Return up to 12 closed SVG path data strings only, each under 8000 chars, for the symbol inside coordinates x80..432 y80..330 on a 512 square. Monogram maximum 6 characters. Use paths, no images, scripts or markup. Use hex ink color.`,file_urls:assets.reference?[assets.reference.url]:[],response_json_schema:logoSchema});
        const paths=(result.paths||[]).slice(0,12).filter(path=>typeof path==='string'&&path.length<8000&&/^[MmLlHhVvCcSsQqTtAaZz\d\s.,+eE-]+$/.test(path));
        patch({logo:refineLogo({...assets.logo,...result,text:String(result.text||'AX').slice(0,6),ink:/^#[0-9a-f]{6}$/i.test(result.ink)?result.ink:'#17130d',bevel:Math.min(10,Math.max(0,Number(result.bevel)||0)),paths},prompt),reel:null});setNotice('Editable vector synthesized. Type refinements for immediate local updates.');
      }else if(intent==='reel'){
        const campaign=await base44.integrations.Core.InvokeLLM({prompt:`Write a concise 9-second three-scene vertical reel script and social copy for: ${prompt}. Do not invent financial results or token-saving percentages. Give product title, short value proposition, audience, 3 social posts, and a week with practical actions.`,file_urls:assets.reference?[assets.reference.url]:[],response_json_schema:reelSchema});
        patch({reelCampaign:{...campaign,url:assets.campaign?.url||'',token_tag:'LOCAL CANVAS · NO VIDEO AI TOKENS'},reel:null,reelRequest:Date.now()});setNotice('Script ready. Printing your vertical reel…');
      }else{
        const {data}=await base44.functions.invoke('generateArticle',{topic:prompt,category:'general',withIllustration:false});if(!data.ok)throw new Error(data.error||'Article generation failed.');patch({article:data});setNotice('Article draft ready, not published.');
      }
    }catch(e){setError(e.response?.data?.error||e.message);setNotice('');}finally{setBusy(false);}
  };
  return {busy,setBusy,error,notice,patch,changePrompt,run};
}