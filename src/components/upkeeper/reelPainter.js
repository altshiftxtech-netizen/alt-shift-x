import {cinemaSettings,cinemaDuration} from '@/components/upkeeper/cinemaSpec';
import {drawCinemaScene,cinemaPalettes} from '@/components/upkeeper/cinemaScenePainter';
import {sceneAt,outroOpacity} from '@/components/upkeeper/canonicalPacing';
import paintWalkthrough from '@/components/upkeeper/paintWalkthrough';
import {drawReferenceFrame} from '@/components/upkeeper/referencePlayback';
import {cinemaFilter} from '@/components/upkeeper/cinemaScenePainter';
export const REEL_SECONDS=15;
export function paintReel(canvas,time,campaign,logo,source,settings,media){
  const ctx=canvas.getContext('2d'),s=cinemaSettings(settings),{index,phase,local,duration,total}=sceneAt(time,s),w=s.aspect==='16:9'?1920:1080,h=s.aspect==='16:9'?1080:1920,enter=Math.min(1,local/.25);canvas.dataset.scene=String(index+1);
  ctx.save();ctx.scale(canvas.width/w,canvas.height/h);ctx.fillStyle=(cinemaPalettes[s.grade]||cinemaPalettes.obsidian)[0];ctx.fillRect(0,0,w,h);ctx.save();
  if(s.referenceCalibrated&&!s.walkthrough?.enabled){ctx.filter=cinemaFilter(s.grade);drawReferenceFrame(ctx,media?.clip,w,h,s.referenceFraming);ctx.filter='none';if(s.referenceOverlays){ctx.fillStyle=`rgba(0,0,0,${1-outroOpacity(time,total)})`;ctx.fillRect(0,0,w,h);}ctx.restore();ctx.restore();return;}
  if(!s.walkthrough?.enabled&&s.transition!=='cut'&&index>0&&enter<1){if(s.transition==='whip')ctx.translate((1-enter)*w,0);else if(s.transition==='match'){ctx.translate(w/2,h/2);ctx.scale(1+(1-enter)*.12,1+(1-enter)*.12);ctx.translate(-w/2,-h/2);}else ctx.globalAlpha=enter;}
  if(s.walkthrough?.enabled)paintWalkthrough(ctx,time,s,media);else drawCinemaScene(ctx,phase,local,duration,campaign,logo,media,s,source);ctx.restore();ctx.fillStyle=(cinemaPalettes[s.grade]||cinemaPalettes.obsidian)[1];ctx.fillRect(0,h-10,w*Math.min(1,time/total),10);ctx.fillStyle=`rgba(0,0,0,${1-outroOpacity(time,total)})`;ctx.fillRect(0,0,w,h);ctx.restore();
}