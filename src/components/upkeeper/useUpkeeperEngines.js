import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { promptIntent,promptUrl,refineLogo,logoSchema } from '@/components/upkeeper/creativePrompt';
import generateCinemaCampaign from '@/components/upkeeper/generateCinemaCampaign';
export default function useUpkeeperEngines(assets,setAssets) {
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const patch=value=>setAssets(previous=>({...previous,...value}));
  const changePrompt=prompt=>setAssets(previous=>({...previous,prompt,...(previous.tab==='logo'?{logo:refineLogo(previous.logo,prompt),reel:null}:{})}));
  const run=async override=>{
    if(busy)return;
    const manual=override&&typeof override==='object'&&typeof override.productText==='string'?override:null;
    const prompt=manual?manual.productText:typeof override==='string'?override:assets.prompt||'',intent=manual?'autopilot':promptIntent(prompt,typeof override==='string'?'autopilot':assets.intent);
    if(!prompt.trim())return;
    setBusy(true);setError('');setNotice('Preparing '+intent+' engine…');patch({tab:intent});
    try {
      if(intent==='autopilot'){
        const url=manual?manual.url:promptUrl(prompt);if(!url&&!manual)throw new Error('Paste a public HTTPS product link or use the pasted-product fallback.');patch({url:url||''});
        const {data}=await base44.functions.invoke('upkeeperHeyCatch',{url:url||'',productText:manual?.productText||''});if(data.error)throw new Error(data.error);patch({campaign:data,reelCampaign:null,reel:null});setNotice(manual?'Research ready from your supplied brief; website access was not verified.':'Customer research and social copy ready.');
      }else if(intent==='logo'){
        const result=await base44.integrations.Core.InvokeLLM({prompt:`Design a logo as editable vector parameters. Request: ${prompt}. Current settings: ${JSON.stringify(assets.logo)}. Honor attached reference silhouette if present. Return up to 12 closed SVG path data strings only, each under 8000 chars, for the symbol inside coordinates x80..432 y80..330 on a 512 square. Monogram maximum 6 characters. Use paths, no images, scripts or markup. Use hex ink color.`,file_urls:assets.reference?[assets.reference.url]:[],response_json_schema:logoSchema});
        const paths=(result.paths||[]).slice(0,12).filter(path=>typeof path==='string'&&path.length<8000&&/^[MmLlHhVvCcSsQqTtAaZz\d\s.,+eE-]+$/.test(path));
        patch({logo:refineLogo({...assets.logo,...result,text:String(result.text||'AX').slice(0,6),ink:/^#[0-9a-f]{6}$/i.test(result.ink)?result.ink:'#17130d',bevel:Math.min(10,Math.max(0,Number(result.bevel)||0)),paths},prompt),reel:null});setNotice('Editable vector synthesized. Type refinements for immediate local updates.');
      }else if(intent==='reel'){
        setNotice('Producing the four-scene script, cinematic hero and b-roll images…');
        const campaign=await generateCinemaCampaign(prompt,assets);
        patch({reelCampaign:campaign,reel:null,reelRequest:null});setNotice('Cinema ready. Review the scenes, then export a still or print the dynamic reel.');
      }else{
        const {data}=await base44.functions.invoke('generateArticle',{topic:prompt,category:'general',withIllustration:false});if(!data.ok)throw new Error(data.error||'Article generation failed.');patch({article:data});setNotice('Article draft ready, not published.');
      }
    }catch(e){setError(e.response?.data?.error||e.message);setNotice('');}finally{setBusy(false);}
  };
  return {busy,setBusy,error,notice,patch,changePrompt,run};
}