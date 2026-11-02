export const synthPresets={
  canonical:{label:'Alt Shift X · Canonical Commercial Master',bpm:120,root:45,mode:'canonical'},
  spaceport:{label:'🚀 Proving Ground Spaceport (Deep Sub-Drone + Telemetry Shimmer)',bpm:120,root:45,mode:'space'},
  fitness:{label:'🏋️ Train Great Fitness (High-Energy Chiseled 808s & Athletic Percussion)',bpm:140,root:55,mode:'fitness'},
  obsidian:{label:'🌌 Obsidian Cyberpunk (Dark Polyhedral Arp & Resonant Filter Sweeps)',bpm:130,root:38,mode:'arp'},
  executive:{label:'🎻 Executive Hans Zimmer (Low Brass Braams, Taiko Drums & String Tension)',bpm:120,root:36,mode:'orchestral'}
};
export function synthSettings(value={}){const preset=synthPresets[value.preset]?value.preset:'canonical';return {enabled:true,attached:true,ambientLevel:.35,musicLevel:.55,...value,preset,bpm:[120,130,140].includes(Number(value.bpm))?Number(value.bpm):synthPresets[preset].bpm};}
export const synthAttached=value=>{const settings=synthSettings(value);return settings.enabled&&settings.attached;};
export function synthDuration(durations){const seconds=durations.reduce((sum,value)=>sum+Number(value),0);if(!Number.isFinite(seconds)||seconds<1||seconds>180)throw new Error('Choose an audio duration between 1 and 180 seconds.');return seconds;}