import {cinemaSettings,cinemaDuration} from '@/components/upkeeper/cinemaSpec';
import {drawCinemaScene,cinemaPalettes} from '@/components/upkeeper/cinemaScenePainter';
export const REEL_SECONDS=15;
export function paintReel(canvas,time,campaign,logo,source,settings,media){
  const ctx=canvas.getContext('2d'),s=cinemaSettings(settings),total=cinemaDuration(s),t=Math.min(Math.max(0,time),total-.001);let index=0,start=0;
  while(index<3&&t>=start+Number(s.durations[index])){start+=Number(s.durations[index]);index++;}
  const local=t-start,enter=Math.min(1,local/.35),scale=canvas.width/1080;canvas.dataset.scene=String(index+1);
  ctx.save();ctx.scale(scale,scale);ctx.fillStyle=(cinemaPalettes[s.grade]||cinemaPalettes.obsidian)[0];ctx.fillRect(0,0,1080,1920);ctx.save();
  if(index>0&&enter<1){if(s.transition==='whip')ctx.translate((1-enter)*1080,0);else if(s.transition==='match'){ctx.translate(540,960);ctx.scale(1+(1-enter)*.15,1+(1-enter)*.15);ctx.translate(-540,-960);}else{drawCinemaScene(ctx,index-1,Number(s.durations[index-1])-.01,Number(s.durations[index-1]),campaign,logo,media,s,source);ctx.globalAlpha=enter;}}
  drawCinemaScene(ctx,index,local,Number(s.durations[index]),campaign,logo,media,s,source);ctx.restore();ctx.fillStyle=(cinemaPalettes[s.grade]||cinemaPalettes.obsidian)[1];ctx.fillRect(0,1910,1080*Math.min(1,t/total),10);ctx.restore();
}