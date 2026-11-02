export const REEL_SECONDS = 9;
function wrap(ctx, text, x, y, width, lineHeight, maxLines=5) {
  const words=String(text||'').split(/\s+/); let line='', lines=0;
  for(const word of words) {
    const next=line?line+' '+word:word;
    if(ctx.measureText(next).width>width && line) {ctx.fillText(line,x,y);y+=lineHeight;line=word;if(++lines>=maxLines-1)break;} else line=next;
  }
  ctx.fillText(line,x,y);
}
export function paintReel(canvas, time, campaign, logo, source) {
  const ctx=canvas.getContext('2d'), scale=canvas.width/1080; ctx.save();ctx.scale(scale,scale);
  const bg=ctx.createLinearGradient(0,0,1080,1920);bg.addColorStop(0,'#111621');bg.addColorStop(1,'#302516');ctx.fillStyle=bg;ctx.fillRect(0,0,1080,1920);
  const scene=Math.min(2,Math.floor(time/3)), local=time%3, enter=Math.min(1,local*3), offset=(1-enter)*60;
  ctx.fillStyle='#e9bf68';ctx.font='600 24px system-ui';ctx.fillText('CUSTOMER FINDER / '+String(scene+1).padStart(2,'0'),70,100);
  if(logo)ctx.drawImage(logo,840,52,170,170);
  ctx.globalAlpha=enter;ctx.fillStyle='#ffffff';ctx.font='800 74px system-ui';
  const titles=[campaign?.product||'Your campaign',campaign?.audience?.[0] ? `Built for ${campaign.audience[0]}`:'Built for your audience','See what is possible'];
  ctx.fillStyle='#e9bf68';ctx.fillRect(70,250+offset,Math.min(900,260+enter*640),12);ctx.fillStyle='#ffffff';
  wrap(ctx,titles[scene],70,350+offset,900,88,4);ctx.font='400 35px system-ui';ctx.fillStyle='#e0ded7';
  const copy=[campaign?.value_proposition,'A focused product. A clear purpose. A practical next step.',campaign?.social_posts?.[0]?.text||campaign?.value_proposition];
  wrap(ctx,copy[scene],70,730+offset,910,49,5);ctx.globalAlpha=1;
  ctx.fillStyle='#ffffff';ctx.fillRect(70,1080,456,535);ctx.fillStyle='#e9bf68';ctx.fillRect(544,1080,466,535);
  ctx.fillStyle='#171b24';ctx.font='700 25px system-ui';ctx.fillText('PRODUCT BRIEF',98,1130);ctx.fillText('SOURCE / WORK',572,1130);
  ctx.font='500 33px system-ui';wrap(ctx,campaign?.value_proposition||'Run Customer Finder to compile your reel.',98,1210,398,46,7);
  ctx.font='400 26px system-ui';wrap(ctx,source||'No source link selected',572,1210,406,38,4);
  ctx.font='500 28px system-ui';wrap(ctx,campaign?.weeks?.[0]?.actions?.[0]||'Campaign-derived plan, not a customer-results claim.',572,1400,406,38,5);
  ctx.fillStyle='#e9bf68';ctx.fillRect(70,1670,940,135);ctx.fillStyle='#171b24';ctx.font='700 30px system-ui';wrap(ctx,campaign?.product||'CAMPAIGN STUDIO',100,1724,850,38,2);
  ctx.fillStyle='#ffffff';ctx.font='500 22px system-ui';ctx.fillText(campaign?.token_tag||'LOCAL CANVAS · NO VIDEO AI TOKENS',70,1835);
  ctx.font='400 22px system-ui';ctx.fillText('Explore the product • '+(source?new URL(source).hostname:'altshiftx.tech'),70,1870);
  ctx.fillStyle='#e9bf68';ctx.fillRect(0,1910,1080*Math.min(1,time/REEL_SECONDS),10);ctx.restore();
}