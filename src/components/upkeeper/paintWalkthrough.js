import walkthroughMotion from '@/components/upkeeper/walkthroughMotion';
export default function paintWalkthrough(ctx,time,settings,media){
  const m=walkthroughMotion(time,settings),image=media?.clip?.readyState>=2?media.clip:media?.hero||media?.broll;
  ctx.fillStyle='#0a1422';ctx.fillRect(0,0,m.w,m.h);
  if(image){ctx.save();ctx.translate(m.left,m.top);ctx.scale(m.scale,m.scale);ctx.drawImage(image,0,0,m.sourceW,m.sourceH);ctx.restore();}
}