export const initialCreativeAssets = { tab: 'autopilot', url: '', campaign: null, logo: { text: 'AX', bevel: 4, finish: 'gold', circle: false, circuits: true }, reel: null };
export function downloadAsset(blob, name) {
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}
const escape = text => String(text).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
export function logoSvg(settings) {
  const colors = { gold: ['#fff2b4','#ca942e','#674318'], obsidian: ['#b4b9c5','#303744','#080c13'], platinum: ['#ffffff','#afbcca','#485765'] }[settings.finish];
  const b = Number(settings.bevel), r = settings.circle ? 256 : 115.2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><linearGradient id="metal" x2=".8" y2="1"><stop stop-color="${colors[0]}"/><stop offset=".35" stop-color="${colors[1]}"/><stop offset=".52" stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[2]}"/></linearGradient><filter id="bevel" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="${b/2}" result="blur"/><feSpecularLighting in="blur" surfaceScale="${b}" specularConstant=".7" specularExponent="22" lighting-color="#fff4cf" result="light"><feDistantLight azimuth="225" elevation="45"/></feSpecularLighting><feComposite in="light" in2="SourceAlpha" operator="in" result="shine"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="shine"/></feMerge></filter><clipPath id="shape"><rect x="16" y="16" width="480" height="480" rx="${r}"/></clipPath></defs><rect x="16" y="16" width="480" height="480" rx="${r}" fill="url(#metal)" filter="url(#bevel)"/><g clip-path="url(#shape)">${settings.circuits ? Array.from({length:10},(_,i)=>{const y=52+i*44;return `<path d="M0 ${y} H${64+i*9} L${100+i*9} ${y+26} H180 M512 ${y} H${448-i*9} L${412-i*9} ${y+26} H332" stroke="#f9cf69" stroke-width="3" fill="none" opacity=".65"/><circle cx="180" cy="${y+26}" r="4" fill="#ffdd84"/><circle cx="332" cy="${y+26}" r="4" fill="#ffdd84"/>`;}).join('') : ''}</g><text x="256" y="285" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${settings.text.length>3?78:126}" font-weight="800" fill="${settings.finish==='obsidian'?'#f7e7bc':'#17130d'}">${escape(settings.text.slice(0,6))}</text></svg>`;
}
export async function logoImage(settings) {
  const image = new Image(); image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(logoSvg(settings));
  await image.decode(); return image;
}
export async function logoPng(settings, size) {
  const image = await logoImage(settings), canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  canvas.getContext('2d').drawImage(image,0,0,size,size);
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Icon export failed.')),'image/png'));
}
export async function logoKit(settings) {
  const [icon, favicon] = await Promise.all([logoPng(settings,512),logoPng(settings,32)]);
  return { 'logo.svg': new Blob([logoSvg(settings)],{type:'image/svg+xml'}), 'pwa-icon-512.png':icon, 'favicon-32.png':favicon };
}