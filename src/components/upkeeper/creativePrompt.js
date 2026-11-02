import {refineEmblem} from '@/components/upkeeper/emblemConversation';
export const promptIntent=(text,choice)=>/https?:\/\/[^\s]+/i.test(text)?'autopilot':choice||(/\b(logo|emblem|icon|vibe)\b/i.test(text)?'logo':/\b(reel|video|commercial)\b/i.test(text)?'reel':'article');
export const promptUrl=text=>text.match(/https?:\/\/[^\s<>"']+/i)?.[0]?.replace(/[),.;]+$/,'')||'';
export function refineLogo(previous,text) {
  const next={...previous}, p=text.toLowerCase();
  if(/chrome/.test(p))next.finish='chrome';else if(/platinum/.test(p))next.finish='platinum';else if(/obsidian/.test(p))next.finish='obsidian';else if(/\b(gold|24k)\b/.test(p))next.finish='gold';
  if(/circle|medal|favicon/.test(p))next.circle=true;else if(/squircle|app icon/.test(p))next.circle=false;
  if(/(?:no|without|remove|disable) (?:gold )?(?:pcb |circuit )?(?:circuits|traces|lines)/.test(p))next.circuits=false;else if(/pcb|circuit/.test(p))next.circuits=true;
  const bevel=p.match(/bevel(?: depth)?(?: to| of|:)?\s*(\d+(?:\.\d+)?)/);if(bevel)next.bevel=Math.min(10,Number(bevel[1]));
  const color=p.includes('electric cyan')?'#00e5ff':text.match(/#[0-9a-f]{6}\b/i)?.[0];if(color&&!/glow/i.test(p))next.ink=color;
  const label=text.match(/(?:text|monogram|letters?)\s+(?:to|is|reads?|says?)\s+["']([^"']{1,6})["']/i)||text.match(/\b([A-Z]{2,6})\b/);if(label)next.text=label[1];
  if(/barbell/.test(p)){next.symbol='barbell';if(/wider/.test(p))next.symbolWidth=1.2;else if(/narrower/.test(p))next.symbolWidth=.8;}
  return refineEmblem(next,text);
}
export const logoSchema={type:'object',properties:{text:{type:'string'},ink:{type:'string'},finish:{type:'string',enum:['gold','chrome','platinum','obsidian']},circle:{type:'boolean'},circuits:{type:'boolean'},bevel:{type:'number'},paths:{type:'array',items:{type:'string'}}},required:['text','ink','finish','circle','circuits','bevel','paths']};
export const reelSchema={type:'object',properties:{product:{type:'string'},value_proposition:{type:'string'},audience:{type:'array',items:{type:'string'}},social_posts:{type:'array',items:{type:'object',properties:{platform:{type:'string'},text:{type:'string'}},required:['platform','text']}},weeks:{type:'array',items:{type:'object',properties:{actions:{type:'array',items:{type:'string'}}},required:['actions']}}},required:['product','value_proposition','audience','social_posts','weeks']};