import {buildEmblemSvg} from '@/components/upkeeper/emblemSvg';
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
  const image = await logoImage(settings), canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  canvas.getContext('2d').drawImage(image,0,0,size,size);
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Icon export failed.')),'image/png'));
}
export async function logoKit(settings) {
  const [icon, favicon] = await Promise.all([logoPng({...settings,exportMode:'icon'},512),logoPng({...settings,exportMode:'favicon'},32)]);
  return { 'logo.svg': new Blob([logoSvg(settings)],{type:'image/svg+xml'}), 'pwa-icon-512.png':icon, 'favicon-32.png':favicon };
}