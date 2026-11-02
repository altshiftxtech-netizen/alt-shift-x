export default function emblemFeatureMarkup(settings,ink,accent){
  const valid=color=>/^#[0-9a-f]{6}$/i.test(color||'');
  return Object.entries(settings.featureLayers||{}).map(([kind,layer])=>{
    if(!['eyes','teeth','visor','sunglasses','nose','mouth'].includes(kind))return '';
    const b=layer.bounds||{},x=Number(b.x),y=Number(b.y),w=Number(b.width),h=Number(b.height);if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)return '';
    const at=(a,c)=>`${x+w*a} ${y+h*c}`,color=valid(layer.color)?layer.color:'url(#emblem-metal)',edge=settings.finish==='neon'?accent:ink,stroke=w*.012,r=w*.055;let body='';
    if(kind==='eyes')body=[.38,.62].map(a=>{const cx=x+w*a,cy=y+h*.42;return `<ellipse cx="${cx}" cy="${cy}" rx="${r*1.4}" ry="${r}" fill="${valid(layer.color)?color:ink}"/><circle cx="${cx}" cy="${cy}" r="${r*.55}" fill="${settings.finish==='neon'?accent:'#111118'}"/><circle cx="${cx+r*.2}" cy="${cy-r*.25}" r="${r*.2}" fill="#ffffff"/>`;}).join('');
    if(kind==='nose')body=`<path d="M${at(.44,.55)} L${at(.56,.55)} L${at(.5,.63)}Z" fill="${color}"/>`;
    if(kind==='mouth')body=`<path d="M${at(.35,.7)} Q${at(.5,.83)} ${at(.65,.7)}" fill="none" stroke="${valid(layer.color)?color:ink}" stroke-width="${stroke*2}"/>`;
    if(kind==='teeth')body=`<path d="M${at(.34,.68)} Q${at(.5,.66)} ${at(.66,.68)} L${at(.62,.79)} Q${at(.5,.83)} ${at(.38,.79)}Z" fill="#111118"/>`+[.41,.47,.53,.59].map(a=>`<path d="M${at(a-.025,.69)} L${at(a+.025,.69)} L${at(a+.02,.755)} L${at(a-.02,.755)}Z" fill="${valid(layer.color)?color:'#ffffff'}"/>`).join('');
    if(kind==='visor')body=`<path d="M${at(.2,.32)} L${at(.5,.37)} L${at(.8,.32)} L${at(.75,.5)} L${at(.5,.54)} L${at(.25,.5)}Z" fill="${color}"/><path d="M${at(.28,.4)} L${at(.45,.43)} M${at(.55,.43)} L${at(.72,.4)}" stroke="${accent}" stroke-width="${stroke*2}"/>`;
    if(kind==='sunglasses')body=[.24,.54].map(a=>`<rect x="${x+w*a}" y="${y+h*.34}" width="${w*.22}" height="${h*.17}" rx="${w*.025}" fill="${valid(layer.color)?color:'#111118'}"/>`).join('')+`<path d="M${at(.46,.4)} L${at(.54,.4)}" stroke="${edge}" stroke-width="${stroke*2}"/>`;
    return `<g id="character-${kind}" stroke="${edge}" stroke-width="${stroke}" stroke-linejoin="round" ${settings.finish==='neon'?'filter="url(#emblem-surface)"':''}>${body}</g>`;
  }).join('');
}