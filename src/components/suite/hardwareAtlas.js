import * as THREE from 'three';
import deviceBrandCrop from '@/components/suite/deviceBrandCrop';

export default function hardwareAtlas(label) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d'), texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
  let logo = null, disposed = false;
  const paint = () => {
    const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
    gradient.addColorStop(0, '#334451'); gradient.addColorStop(.5, '#14212b'); gradient.addColorStop(1, '#293a46');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1024, 1024);
    ctx.strokeStyle = '#0a1118'; ctx.lineWidth = 16; ctx.strokeRect(28, 28, 968, 968);
    ctx.strokeStyle = '#a0afb5'; ctx.lineWidth = 3; ctx.strokeRect(49, 49, 926, 926);
    ctx.strokeStyle = '#718593'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(110, 110, 804, 650, 35); ctx.stroke();
    ctx.fillStyle = '#0b151c'; ctx.fillRect(840, 410, 40, 110);
    ctx.fillStyle = '#c3cdd0'; ctx.fillRect(852, 430, 15, 65);
    for (const x of [73, 951]) for (const y of [73, 512, 951]) {
      ctx.fillStyle = '#8597a0'; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#18232c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.stroke();
    }
    for (const y of [250, 590]) { ctx.fillStyle = '#89999f'; ctx.fillRect(92, y, 36, 65); ctx.fillStyle = '#26323b'; ctx.fillRect(101, y + 7, 18, 51); }
    if (logo) {
      ctx.save(); ctx.filter = 'saturate(1.2) contrast(1.06)';
      ctx.drawImage(logo, 172, 135, 680, 680 * 520 / 812); ctx.restore();
    }
    ctx.textAlign = 'center'; ctx.fillStyle = '#f2e0a5'; ctx.font = 'bold 57px sans-serif'; ctx.fillText('ALTSHIFTX.TECH', 512, 636);
    ctx.fillStyle = '#c8d7df'; ctx.font = '25px monospace'; ctx.fillText(label, 512, 690);
    ctx.fillStyle = '#87c4cb'; ctx.font = '20px monospace'; ctx.fillText('SERVICE ACCESS  /  ISOLATE BEFORE OPENING', 512, 735);
    for (let i = 0; i < 9; i++) { ctx.fillStyle = '#071118'; ctx.fillRect(185 + i * 75, 795, 47, 70); ctx.fillStyle = '#68818c'; ctx.fillRect(185 + i * 75, 795, 47, 5); }
    ctx.fillStyle = '#b69c58'; ctx.fillRect(146, 908, 732, 27);
    ctx.save(); ctx.beginPath(); ctx.rect(146, 908, 732, 27); ctx.clip(); ctx.strokeStyle = '#17232b'; ctx.lineWidth = 22;
    for (let x = 120; x < 920; x += 55) { ctx.beginPath(); ctx.moveTo(x, 948); ctx.lineTo(x + 45, 896); ctx.stroke(); } ctx.restore();
    texture.needsUpdate = true;
  };
  deviceBrandCrop().then(crop => { if (!disposed) { logo = crop; paint(); } }); paint();
  texture.addEventListener('dispose', () => { disposed = true; });
  return texture;
}