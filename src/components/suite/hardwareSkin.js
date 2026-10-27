import * as THREE from 'three';

export default function hardwareSkin() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d'), shade = ctx.createLinearGradient(0, 0, 512, 512);
  shade.addColorStop(0, '#f7f9fa'); shade.addColorStop(.5, '#e5ebee'); shade.addColorStop(1, '#f2f5f6');
  ctx.fillStyle = shade; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(87,110,125,.12)'; ctx.lineWidth = .5;
  for (let y = 0; y < 512; y += 3) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke(); }
  for (const [x, y, w, h] of [[18, 18, 302, 228], [338, 18, 156, 228], [18, 264, 218, 230], [254, 264, 240, 230]]) {
    ctx.strokeStyle = '#8c9ca6'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x + 12, y); ctx.lineTo(x + w - 12, y); ctx.lineTo(x + w, y + 12); ctx.lineTo(x + w, y + h - 12); ctx.lineTo(x + w - 12, y + h); ctx.lineTo(x + 12, y + h); ctx.lineTo(x, y + h - 12); ctx.lineTo(x, y + 12); ctx.closePath(); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
    for (const bx of [x + 11, x + w - 11]) for (const by of [y + 11, y + h - 11]) {
      ctx.fillStyle = '#82939d'; ctx.beginPath(); ctx.arc(bx, by, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d8e0e4'; ctx.fillRect(bx - 1.5, by - .5, 3, 1);
    }
    ctx.fillStyle = '#9caeb8'; ctx.fillRect(x + w - 29, y + h / 2 - 12, 5, 24);
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; return texture;
}