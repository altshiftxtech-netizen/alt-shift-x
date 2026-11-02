import {guardCinemaDirective} from '@/components/upkeeper/cinemaBrandGuard';
import {canonicalPresets} from '@/components/upkeeper/canonicalPacing';
export const pacingPresets=canonicalPresets;
export const gradeNames={original:'Original source colors',obsidian:'Obsidian chiaroscuro',teal:'Teal-orange',kodachrome:'Kodachrome',chrome:'Specular chrome'};
export function cinemaSettings(value={}){const s={preset:'speedrun',...canonicalPresets.speedrun,aspect:'9:16',textAccent:'cyan',...value};s.caption=({pulse:'punch',glass:'lower-third',typewriter:'stinger'})[s.caption]||s.caption;return s;}
export const cinemaDuration=value=>cinemaSettings(value).durations.reduce((sum,n)=>sum+Number(n),0);
export function cinematicDirective(prompt,value={}){
  const s=cinemaSettings(value);if(s.directive&&s.directiveSource===prompt)return guardCinemaDirective(s.directive,prompt);
  return guardCinemaDirective(`SUBJECT & FRAMING: ${prompt||'A distinctive product story'}. Open on a striking focal subject in a low Dutch angle; move through a macro detail cut and an overhead reveal. Keep the subject consistent across hero and secondary b-roll.\nLENS & LIGHTING: 35mm f/1.4 shallow depth-of-field, anamorphic flare, volumetric rim lighting, controlled specular highlights and deep shadow separation.\nGRADING & ATMOSPHERE: ${gradeNames[s.grade]}, cinematic contrast, refined grain, tactile material detail. Protect clear negative space for readable captions.\nSEQUENCE: ${s.durations.map((n,i)=>`${n}s ${s.names?.[i]||'shot '+(i+1)}`).join(', ')}. ${s.caption} vector overlay captions, ${s.transition} transitions. ${s.aspect}, no fabricated results or claims. Generate visuals without text; exact titles are overlaid separately.`,prompt);
}