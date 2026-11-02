export const emblemPresets=[['crest','Athletic Crest'],['mascot','Mascot Character'],['medal','Circular Medal'],['tech','Modern Tech Monogram']];
export function emblemPreset(previous,preset) {
  const shapes={crest:{frame:'crest',character:'none',symbol:'barbell',props:['barbell'],banner:true,circuits:false},mascot:{frame:'crest',character:'mascot',symbol:'',props:[],banner:true,circuits:false},medal:{frame:'medal',character:'none',symbol:'',props:[],banner:false,circuits:false},tech:{frame:'squircle',character:'none',symbol:'',props:['delta'],banner:false,circuits:true}};
  return {...previous,...shapes[preset],paths:[],featureLayers:{},modifierAssist:null,visor:false,frameWidth:1,circle:preset==='medal'};
}
export function refineEmblem(previous,text) {
  const next={...previous},p=text.toLowerCase(),props=new Set(previous.props||[]);
  if(/crest|shield/.test(p))next.frame='crest';else if(/circular|circle|medal|coin/.test(p))next.frame='medal';else if(/squircle|app icon/.test(p))next.frame='squircle';
  if(/(?:crest|frame|shield).*wider|wider.*(?:crest|frame|shield)/.test(p))next.frameWidth=Math.min(1.05,(previous.frameWidth||.85)+.08);
  if(/(?:crest|frame|shield).*narrower|narrower.*(?:crest|frame|shield)/.test(p))next.frameWidth=Math.max(.72,(previous.frameWidth||1)-.08);
  if(/mascot|character|portrait|robot/.test(p)&&!next.character)next.character=/robot|cybernetic/.test(p)?'robot':'mascot';
  if(/robot/.test(p))next.character='robot';else if(/mascot/.test(p))next.character='mascot';
  if(/visor/.test(p)){next.visor=!/remove.*visor|without.*visor|no visor/.test(p);if(next.visor&&(!next.character||next.character==='none'))next.character='robot';}
  for(const [word,key] of [['barbell','barbell'],['sword','sword'],['delta|chevron','delta']])if(new RegExp(word).test(p)){if(new RegExp('(?:remove|without|no).*'+word).test(p))props.delete(key);else props.add(key);}
  if(/remove.*barbell|no barbell|without.*barbell/.test(p))next.symbol='';
  if(/banner|ribbon|athletic typography/.test(p))next.banner=!/remove.*(?:banner|ribbon)|no (?:banner|ribbon)/.test(p);
  if(/neon|cyberpunk/.test(p))next.finish='neon';else if(/comic|cel.shad/.test(p))next.finish='comic';
  if(/glow/.test(p)){next.glow=!/remove.*glow|no glow|without.*glow/.test(p);next.glowColor=/magenta/.test(p)?'#ff35bc':'#00e5ff';}
  const monogram=text.match(/(?:monogram|wordmark|text|letters?)\s+(?:(?:into|to|is|reads?|says?)\s+)?["']?([a-z0-9]{1,6})\b/i);if(monogram&&!['into','to','is','reads','says'].includes(monogram[1].toLowerCase()))next.text=monogram[1].toUpperCase();
  next.props=[...props];return next;
}
export const isProceduralEdit=text=>/crest|shield|wider|narrower|monogram|wordmark|letters|text|glow|visor|barbell|sword|delta|chevron|ribbon|banner|chrome|gold|obsidian|platinum|neon|comic|cyberpunk|mascot|robot|circle|circular|medal|squircle|circuit|bevel|#[0-9a-f]{6}/i.test(text);