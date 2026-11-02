import {safePaths} from '@/components/upkeeper/emblemGeometry';
const features=/\b(eyes?|pupils?|teeth|tooth|visor|sunglasses|nose|snout|mouth|jaw)\b/i;
export const isVectorModifier=text=>(features.test(text)&&/^(?:add|put|give|change|make|remove|delete|without|no|color|colour|eyes?|pupils?|teeth|visor|sunglasses|nose|snout|mouth|jaw)\b/i.test(text.trim()))||/^(?:add|put|give|change|make)\b/i.test(text.trim())&&!/\b(crest|frame|shield|barbell|sword|wordmark|monogram|text|letters|banner|ribbon|circuit|bevel|glow|mascot|character|robot|chrome|gold|obsidian|platinum|neon|comic|finish|material)\b/i.test(text);
export function characterBounds(){
  const node=document.querySelector('[data-testid="logo-preview"] #character-base');if(!node)return null;
  const box=node.getBBox();return box.width>0&&box.height>0?{x:box.x,y:box.y,width:box.width,height:box.height}:null;
}
export default function UpkeeperVectorModifier(previous,text,bounds){
  if(!isVectorModifier(text))return null;
  const active=Boolean(previous.character&&previous.character!=='none'||safePaths(previous.paths).length),p=text.toLowerCase();
  const box=bounds||{x:100,y:90,width:312,height:240};
  const matches=[['eyes',/\b(eyes?|pupils?)\b/],['teeth',/\b(teeth|tooth)\b/],['visor',/\bvisor\b/],['sunglasses',/\bsunglasses\b/],['nose',/\b(nose|snout)\b/],['mouth',/\b(mouth|jaw)\b/]].filter(([,pattern])=>pattern.test(p));
  if(!active||!matches.length)return {logo:{...previous,modifierAssist:box},reply:active?'Choose the facial feature to change.':'Choose a mascot preset or create a character first.',ambiguous:true};
  const colors={gold:'#e6bd4d',white:'#ffffff',black:'#111118',red:'#ef4444',blue:'#00a8ff',green:'#22c55e',silver:'#c0c6ce',cyan:'#00e5ff',purple:'#a855f7',pink:'#ff35bc'};
  const named=Object.keys(colors).find(name=>new RegExp('\\b'+name+'\\b').test(p)),color=text.match(/#[0-9a-f]{6}\b/i)?.[0]||(named?colors[named]:null);
  if(/\b(change|make|color|colour)\b/.test(p)&&!color&&!/classic|cyber|chiseled|chrome|neon/.test(p))return {logo:{...previous,modifierAssist:box},reply:'Choose a feature style or name its color.',ambiguous:true};
  const layers={...previous.featureLayers};for(const [key] of matches){if(/\b(remove|without|delete|no)\b/.test(p))delete layers[key];else layers[key]={bounds:box,color:color||layers[key]?.color||null};}
  if(layers.visor&&matches.some(([key])=>key==='visor'))delete layers.sunglasses;if(layers.sunglasses&&matches.some(([key])=>key==='sunglasses'))delete layers.visor;
  return {logo:{...previous,featureLayers:layers,modifierAssist:null},reply:'Updated '+matches.map(([key])=>key).join(', ')+' only; the character, material and other layers are preserved.'};
}