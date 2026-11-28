import React from 'react';
import { badgeUrl, badgeRect } from '@/components/upkeeper/commercial/crystalBadge';
export function AltShiftXWatermark({position='bottom-right',opacity=0.65,showText=true,aspect='9:16'}) {
  const [w,h]=aspect.split(':').map(Number);
  const rect=badgeRect(w,h,position,showText);
  return <img alt="Alt+Shift+X crystal watermark" src={badgeUrl(showText)} draggable={false} className="absolute pointer-events-none motion-safe:transition-[left,top,opacity] motion-safe:duration-300" style={{left:`${100*rect.x/w}%`,top:`${100*rect.y/h}%`,width:`${100*rect.width/w}%`,opacity}} />;
}
export default AltShiftXWatermark;