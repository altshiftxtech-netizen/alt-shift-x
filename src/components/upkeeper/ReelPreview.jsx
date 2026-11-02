import React, {useEffect,useRef,useState} from 'react';
import {logoImage} from '@/components/upkeeper/creativeAssets';
import {paintReel} from '@/components/upkeeper/reelPainter';
import {cinemaDuration} from '@/components/upkeeper/cinemaSpec';
import {loadCinemaMedia,releaseCinemaMedia} from '@/components/upkeeper/cinemaReference';
export default function ReelPreview({campaign,logo,url,settings,reference}) {
  const ref=useRef(null),[error,setError]=useState('');
  useEffect(()=>{
    let frame,disposed=false,image,media,visible=true;const start=performance.now();setError('');
    Promise.all([logoImage(logo),loadCinemaMedia(campaign,reference)]).then(([value,loaded])=>{if(disposed){releaseCinemaMedia(loaded);return;}image=value;media=loaded;if(visible&&!document.hidden)media.clip?.play().catch(()=>{});}).catch(e=>{if(!disposed)setError(e.message);});
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible)media?.clip?.pause();else if(!document.hidden)media?.clip?.play().catch(()=>{});});observer.observe(ref.current);
    const visibility=()=>{if(document.hidden)media?.clip?.pause();else if(visible)media?.clip?.play().catch(()=>{});};document.addEventListener('visibilitychange',visibility);
    const tick=()=>{if(disposed)return;if(visible&&!document.hidden)paintReel(ref.current,((performance.now()-start)/1000)%cinemaDuration(settings),campaign,image,url,settings,media);frame=requestAnimationFrame(tick);};tick();
    return ()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);releaseCinemaMedia(media);};
  },[campaign,logo,url,settings,reference]);
  return <div className="space-y-2"><canvas ref={ref} width={1080} height={1920} aria-label="Vertical campaign reel preview" className="creative-reel rounded-xl border w-full"/>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}</div>;
}