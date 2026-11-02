import React, { useEffect, useRef } from 'react';
import { logoImage } from '@/components/upkeeper/creativeAssets';
import { paintReel, REEL_SECONDS } from '@/components/upkeeper/reelPainter';
export default function ReelPreview({campaign,logo,url}) {
  const ref=useRef(null);
  useEffect(()=>{
    let frame,disposed=false,image,visible=true;const start=performance.now();
    logoImage(logo).then(value=>{if(!disposed)image=value;});
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});observer.observe(ref.current);
    const tick=()=>{if(disposed)return;if(visible&&!document.hidden)paintReel(ref.current,((performance.now()-start)/1000)%REEL_SECONDS,campaign,image,url);frame=requestAnimationFrame(tick);};tick();
    return ()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();};
  },[campaign,logo,url]);
  return <canvas ref={ref} width={1080} height={1920} aria-label="Vertical campaign reel preview" className="creative-reel rounded-xl border w-full"/>;
}