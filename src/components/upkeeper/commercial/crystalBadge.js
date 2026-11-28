export const defaultWatermark = { enabled: false, position: 'bottom-right', opacity: 0.65 };
const svg = (text) => `<svg xmlns="http://www.w3.org/2000/svg" width="${text ? 238 : 62}" height="62" viewBox="0 0 ${text ? 238 : 62} 62"><defs><linearGradient id="a" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#38bdf8"/><stop offset="1" stop-color="#0284c7"/></linearGradient><linearGradient id="b" x2="0" y2="1"><stop stop-color="#f8fafc"/><stop offset="1" stop-color="#0ea5e9" stop-opacity=".3"/></linearGradient></defs><rect x="1" y="1" width="${text ? 236 : 60}" height="60" rx="12" fill="#050a10" fill-opacity=".55" stroke="#fff" stroke-opacity=".18"/><g transform="translate(10 10) scale(.42)"><polygon points="50,5 92,28 92,72 50,95 8,72 8,28" fill="url(#a)" stroke="#7dd3fc" stroke-width="2"/><path d="M50 5V50L92 28Z" fill="url(#b)"/><path d="M50 5L8 28 50 50Z" fill="#bae6fd" opacity=".75"/><path d="M50 50L92 72 50 95Z" fill="#0369a1"/><path d="M50 50V95L8 72Z" fill="url(#b)" opacity=".6"/><path d="M50 22L68 50 50 78 32 50Z" fill="white" opacity=".3"/></g>${text ? '<text x="64" y="39" font-family="monospace" font-weight="bold" font-size="22" letter-spacing="1" fill="#e2e8f0">ALT<tspan fill="#38bdf8">+</tspan>SHIFT<tspan fill="#38bdf8">+</tspan>X</text>' : ''}</svg>`;
export const badgeUrl = text => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(text));
export function badgeRect(w,h,position,text=true) {
  const s=Math.min(w,h)/1080, width=(text?238:62)*s, height=62*s, pad=32*s;
  return {x:position.endsWith('left')?pad:w-width-pad,y:position.startsWith('top')?pad:h-height-pad,width,height};
}
export async function prepareBadge(settings) {
  if (!settings.enabled) return {};
  const image=new Image(); image.src=badgeUrl(true); await image.decode();
  return { badge: { ...settings,image } };
}
export function drawBadge(ctx,w,h,badge) {
  if (!badge) return;
  const {x,y,width,height}=badgeRect(w,h,badge.position);
  ctx.save(); ctx.globalAlpha=badge.opacity; ctx.drawImage(badge.image,x,y,width,height); ctx.restore();
}