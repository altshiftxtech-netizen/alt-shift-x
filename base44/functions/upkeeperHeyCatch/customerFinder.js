const strings={type:'array',items:{type:'string'}};
export const customerFinderSchema={type:'object',properties:{
  accessible:{type:'boolean'},product:{type:'string'},audience:strings,value_proposition:{type:'string'},objections:strings,limitations:{type:'string'},sources:strings,
  metadata:{type:'object',properties:{title:{type:'string'},description:{type:'string'},cta:{type:'string'}},required:['title','description','cta']},
  icp:{type:'object',properties:{target_buyer_persona:{type:'string'},pain_points:strings,differentiators:strings,conversion_action:{type:'string'}},required:['target_buyer_persona','pain_points','differentiators','conversion_action']},
  discussions:{type:'array',maxItems:6,items:{type:'object',properties:{platform:{type:'string'},title:{type:'string'},url:{type:'string'},quote:{type:'string'},posted_at:{type:'string'},reply:{type:'string'}},required:['platform','title','url','quote','posted_at','reply']}},
  weeks:{type:'array',minItems:3,maxItems:3,items:{type:'object',properties:{title:{type:'string'},goal:{type:'string'},days:{type:'array',minItems:7,maxItems:7,items:{type:'object',properties:{action:{type:'string'},success_metric:{type:'string'}},required:['action','success_metric']}}},required:['title','goal','days']}},
  social_posts:{type:'array',items:{type:'object',properties:{platform:{type:'string'},text:{type:'string'}},required:['platform','text']}}
},required:['accessible','product','audience','value_proposition','objections','limitations','sources','metadata','icp','discussions','weeks','social_posts']};
const publicUrl=value=>{try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password;}catch{return false;}};
const discussionUrl=value=>{if(!publicUrl(value))return false;const url=new URL(value);return (['x.com','www.x.com','twitter.com','www.twitter.com'].includes(url.hostname)&&/^\/[^/]+\/status\/\d+/.test(url.pathname))||(['reddit.com','www.reddit.com','old.reddit.com'].includes(url.hostname)&&/\/comments\//.test(url.pathname))||(['linkedin.com','www.linkedin.com'].includes(url.hostname)&&/^\/(posts|feed\/update)\//.test(url.pathname))||(['indiehackers.com','www.indiehackers.com'].includes(url.hostname)&&/^\/post\//.test(url.pathname));};
const list=value=>Array.isArray(value)?value.filter(item=>typeof item==='string'&&item.trim()).map(item=>item.trim()):[];
export function normalizeCustomerFinder(result,{url,productText}) {
  const icp=result.icp;
  if(!icp?.target_buyer_persona?.trim()||!icp.conversion_action?.trim()||!list(icp.pain_points).length||!list(icp.differentiators).length)throw new Error('Incomplete customer profile.');
  if(result.weeks?.length!==3||result.weeks.some(week=>week.days?.length!==7||week.days.some(day=>!day.action?.trim()||!day.success_metric?.trim())))throw new Error('Incomplete 21-day sprint.');
  const weeks=result.weeks.map((week,i)=>({...week,days:week.days.map((day,j)=>({...day,day:i*7+j+1})),actions:week.days.map(day=>day.action)}));
  const discussions=(result.discussions||[]).filter(item=>discussionUrl(item.url)&&item.quote?.trim()&&item.reply?.trim());
  return {...result,icp:{target_buyer_persona:icp.target_buyer_persona.trim(),pain_points:list(icp.pain_points),differentiators:list(icp.differentiators),conversion_action:icp.conversion_action.trim()},weeks,discussions,sources:list(result.sources).filter(publicUrl),
    ...(productText?{accessible:false,limitations:'Product details came from a user-supplied brief; website access was not verified. '+result.limitations}:{}),input_mode:productText?'manual':'website',url:url?.href||'',researched_at:new Date().toISOString(),ad_spend:0};
}