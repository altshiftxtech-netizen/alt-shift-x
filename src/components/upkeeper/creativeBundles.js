import JSZip from 'jszip';
import {downloadAsset,logoKit} from '@/components/upkeeper/creativeAssets';
export const socialCopy=assets=>(assets.reelCampaign||assets.campaign)?.social_posts?.map(post=>`## ${post.platform}\n\n${post.text}`).join('\n\n')||'';
export async function exportCreativeBundle(assets,onlyLogo=false) {
  const zip=new JSZip(),kit=await logoKit(assets.logo);
  for(const [name,blob] of Object.entries(kit))zip.file('logo/'+name,blob);
  if(!onlyLogo){
    if(assets.campaign)zip.file('campaign/research.json',JSON.stringify(assets.campaign,null,2));
    if(assets.reelCampaign)zip.file('campaign/reel-script.json',JSON.stringify(assets.reelCampaign,null,2));
    if(socialCopy(assets))zip.file('campaign/social-copy.md',socialCopy(assets));
    if(assets.reel)zip.file('video/reel.'+assets.reel.extension,assets.reel.blob);
    if(assets.article)zip.file('article.md',`# ${assets.article.title}\n\n${assets.article.body}`);
    if(assets.reference)zip.file('reference.json',JSON.stringify(assets.reference,null,2));
    zip.file('manifest.json',JSON.stringify({prompt:assets.prompt||'',source:assets.campaign?.url||'',files:Object.keys(zip.files).filter(name=>!zip.files[name].dir)},null,2));
  }
  const blob=await zip.generateAsync({type:'blob',compression:'STORE'});downloadAsset(blob,onlyLogo?'upkeeper-logo-kit.zip':'upkeeper-campaign.zip');
  return Object.values(zip.files).filter(file=>!file.dir).length;
}