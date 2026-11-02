import React, {useEffect,useRef,useState} from 'react';
import {logoImage} from '@/components/upkeeper/creativeAssets';
import {paintReel} from '@/components/upkeeper/reelPainter';
import {cinemaDuration} from '@/components/upkeeper/cinemaSpec';
import {loadCinemaMedia,releaseCinemaMedia} from '@/components/upkeeper/cinemaReference';
import UpkeeperKineticTextLayer from '@/components/upkeeper/UpkeeperKineticTextLayer';
import {cinemaSize} from '@/components/upkeeper/canonicalPacing';
export default function ReelPreview({campaign,logo,url,settings,reference}) {
  const ref=useRef(null),[error,setError]=useState(''),[time,setTime]=useState(0),size=cinemaSize(1080,settings?.aspect);
  useEffect(()=>{
    let frame,disposed=false,image,media,visible=true;const start=performance.now();setError('');
    Promise.all([logoImage(logo),loadCinemaMedia(campaign,reference)]).then(([value,loaded])=>{if(disposed){releaseCinemaMedia(loaded);return;}image=value;media=loaded;if(visible&&!document.hidden)media.clip?.play().catch(()=>{});}).catch(e=>{if(!disposed)setError(e.message);});
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible)media?.clip?.pause();else if(!document.hidden)media?.clip?.play().catch(()=>{});});observer.observe(ref.current);
    const visibility=()=>{if(document.hidden)media?.clip?.pause();else if(visible)media?.clip?.play().catch(()=>{});};document.addEventListener('visibilitychange',visibility);
    const tick=()=>{if(disposed)return;if(visible&&!document.hidden){const t=((performance.now()-start)/1000)%cinemaDuration(settings);paintReel(ref.current,t,campaign,image,url,settings,media);setTime(t);}frame=requestAnimationFrame(tick);};tick();
    return ()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);releaseCinemaMedia(media);};
  },[campaign,logo,url,settings,reference]);
  return <div className="space-y-2"><div className={settings?.aspect==='16:9'?'relative w-full rounded-xl border overflow-hidden':'relative w-full max-w-80 mx-auto rounded-xl border overflow-hidden'}><canvas ref={ref} width={size.width} height={size.height} aria-label="Campaign reel visual preview" className="block w-full"/><UpkeeperKineticTextLayer time={time} campaign={campaign} source={url} settings={settings}/></div>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}</div>;
}