export const walkthroughSteps=[{x:.16,y:.18,action:'click',text:'Choose a tab'},{x:.5,y:.52,action:'drag',endX:.72,endY:.52,text:'Adjust the slider'},{x:.76,y:.84,action:'click',text:'Review results'}];
export const walkthroughConfig=value=>({enabled:false,hud:true,zoom:1.4,...value,steps:value?.steps?.length?value.steps:walkthroughSteps});
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const point=s=>({x:clamp(Number(s.x)||0,0,1),y:clamp(Number(s.y)||0,0,1)});
const end=s=>s.action==='drag'?point({x:s.endX??s.x,y:s.endY??s.y}):point(s);
const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
export default function walkthroughMotion(time,settings){
  const config=walkthroughConfig(settings.walkthrough),w=settings.aspect==='16:9'?1920:1080,h=settings.aspect==='16:9'?1080:1920,total=(settings.durations||[15]).reduce((sum,n)=>sum+Number(n),0),span=total/config.steps.length,t=clamp(time,0,total-.0001),index=Math.min(config.steps.length-1,Math.floor(t/span)),local=t-index*span,phase=local/span,step=config.steps[index],from=index?end(config.steps[index-1]):{x:.35,y:.4},target=point(step),travel=smooth(phase/.6),bend=.12;
  const a={x:from.x+(target.x-from.x)*.25,y:from.y-bend},b={x:target.x-(target.x-from.x)*.25,y:target.y+bend},u=1-travel;
  let cursor={x:u*u*u*from.x+3*u*u*travel*a.x+3*u*travel*travel*b.x+travel*travel*travel*target.x,y:u*u*u*from.y+3*u*u*travel*a.y+3*u*travel*travel*b.y+travel*travel*travel*target.y};
  if(step.action==='drag'&&phase>=.6)cursor=mix(target,end(step),smooth((phase-.6)/.35));
  let focus=mix(from,target,travel);if(step.action==='drag'&&phase>=.6)focus=mix(target,end(step),smooth((phase-.6)/.35));
  const sourceW=1920,sourceH=sourceW/(settings.walkthrough?.sourceAspect||16/9),scale=Math.max(w/sourceW,h/sourceH)*clamp(Number(config.zoom)||1.15,1,2),left=clamp(w/2-focus.x*sourceW*scale,w-sourceW*scale,0),top=clamp(h/2-focus.y*sourceH*scale,h-sourceH*scale,0),project=p=>({x:left+p.x*sourceW*scale,y:top+p.y*sourceH*scale}),age=local-span*.65;
  return {config,w,h,total,index,step,cursor:project(cursor),anchor:project(target),dragEnd:project(end(step)),sourceW,sourceH,scale,left,top,pulse:step.action==='click'&&age>=0&&age<.3?age/.3:null,dragging:step.action==='drag'&&phase>=.6&&phase<=.95,float:-4*Math.sin(t*1.6),opacity:clamp((total-t)/1.2,0,1)};
}