export const escapeXml=value=>String(value||'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
export const safePaths=paths=>(paths||[]).filter(p=>typeof p==='string'&&p.length<8000&&/^[MmLlHhVvCcSsQqTtAaZz\d\s.,+eE-]+$/.test(p)).slice(0,24);
export function frameShape(frame,attrs='') {
  if(frame==='crest')return `<path d="M256 24L468 94L438 306Q410 408 256 484Q102 408 74 306L44 94Z" ${attrs}/>`;
  if(frame==='medal')return `<circle cx="256" cy="256" r="232" ${attrs}/>`;
  return `<rect x="24" y="24" width="464" height="464" rx="115.2" ${attrs}/>`;
}
export function characterMarkup(s,ink,accent) {
  const visor=s.visor&&!s.featureLayers?.visor&&!s.featureLayers?.sunglasses?`<path d="M158 180L256 198L354 180L340 242L256 260L172 242Z" fill="${ink}" stroke="${accent}" stroke-width="8"/><path d="M184 214L242 226M272 226L328 214" stroke="${accent}" stroke-width="8"/>`:'';
  const paths=safePaths(s.paths);if(paths.length)return `<g fill="${ink}" transform="translate(256 0) scale(${Math.max(.6,Math.min(1.25,Number(s.symbolWidth)||1))} 1) translate(-256 0)">${paths.map(d=>`<path d="${d}"/>`).join('')}</g>${visor}`;
  if(!s.character||s.character==='none')return '';
  const head=s.character==='mascot'?'M146 168L112 88L204 118Q256 88 308 118L400 88L366 168L372 276L310 340H202L140 276Z':'M168 128L224 98H288L344 128L370 254L326 326H186L142 254Z';
  return `<path d="${head}" fill="url(#emblem-metal)" stroke="${ink}" stroke-width="10" stroke-linejoin="round"/><path d="M256 108L340 142L358 248L316 308H256Z" fill="${ink}" opacity=".28"/>${!s.featureLayers?.eyes&&!s.featureLayers?.visor&&!s.featureLayers?.sunglasses?`<path d="M170 212L228 228M284 228L342 212" stroke="${accent}" stroke-width="14" stroke-linecap="square"/>`:''}${!s.featureLayers?.teeth&&!s.featureLayers?.mouth?`<path d="M206 276L256 294L306 276L290 316H222Z" fill="${ink}"/>`:''}${visor}`;
}
export function propMarkup(s,ink,accent) {
  const props=s.props||[],barbell=s.symbol==='barbell'||props.includes('barbell');
  return `${barbell?`<g transform="translate(256 0) scale(${Math.max(.6,Math.min(1.25,Number(s.symbolWidth)||1))} 1) translate(-256 0)" fill="url(#emblem-metal)" stroke="${ink}" stroke-width="4"><path d="M112 330H400V350H112Z"/><path d="M104 296H128V384H104ZM80 312H104V368H80ZM384 296H408V384H384ZM408 312H432V368H408Z"/></g>`:''}${props.includes('sword')?`<path d="M248 136H264V354H288L256 402L224 354H248Z" fill="url(#emblem-metal)" stroke="${ink}" stroke-width="4"/><path d="M216 166H296" stroke="${accent}" stroke-width="12"/>`:''}${props.includes('delta')?`<path d="M130 296L174 252L218 296M294 296L338 252L382 296M130 318L174 274L218 318M294 318L338 274L382 318" fill="none" stroke="${accent}" stroke-width="9"/>`:''}${s.circuits?`<g stroke="${accent}" fill="none" stroke-width="3" opacity=".75">${[110,158,206,254,302].map((y,i)=>`<path d="M52 ${y}H${82+i*7}L${104+i*7} ${y+22}H150M460 ${y}H${430-i*7}L${408-i*7} ${y+22}H362"/><circle cx="150" cy="${y+22}" r="4" fill="${accent}"/><circle cx="362" cy="${y+22}" r="4" fill="${accent}"/>`).join('')}</g>`:''}`;
}
export function wordmarkMarkup(s,ink) {
  const text=escapeXml(String(s.text||'AX').slice(0,6));
  return `${s.banner?`<path d="M82 372Q256 342 430 372L414 434Q256 406 98 434Z" fill="url(#emblem-metal)" stroke="${ink}" stroke-width="5"/>`:''}<text x="256" y="${s.banner?410:s.character&&s.character!=='none'||safePaths(s.paths).length||s.symbol==='barbell'?438:296}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${s.banner?54:String(s.text||'AX').length>3?64:94}" font-weight="900" letter-spacing="2" fill="${ink}">${text}</text>`;
}