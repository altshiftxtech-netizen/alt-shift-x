import {buildEmblemSvg} from '@/components/upkeeper/emblemSvg';
import {rasterizeEmblem} from '@/components/upkeeper/emblemRaster';
export const initialCreativeAssets = { tab: 'autopilot', url: '', campaign: null, logo: { text: 'AX', bevel: 4, finish: 'gold', circle: false, circuits: true }, reel: null };
export function downloadAsset(blob, name) {
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}
export function logoSvg(settings) { return buildEmblemSvg(settings,settings.exportMode||'vector'); }
export async function logoImage(settings) {
  const image = new Image(); image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(logoSvg(settings));
  await image.decode(); return image;
}
export async function logoPng(settings, size) {
  return rasterizeEmblem(settings,{width:size,mode:size<=32?'favicon':settings.exportMode||'vector'});
}
export async function logoKit(settings) {
  const [icon, favicon] = await Promise.all([logoPng({...settings,exportMode:'icon'},512),logoPng({...settings,exportMode:'favicon'},32)]);
  return { 'logo.svg': new Blob([logoSvg(settings)],{type:'image/svg+xml'}), 'pwa-icon-512.png':icon, 'favicon-32.png':favicon };
}