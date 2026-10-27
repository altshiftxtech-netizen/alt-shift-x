import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export default function builderBotAds() {
  const face = new THREE.PlaneGeometry(.81, .65), frame = new RoundedBoxGeometry(.86, .7, .035, 2, .025);
  const trim = new THREE.MeshStandardMaterial({ color: '#bfa260', metalness: .75, roughness: .35 });
  const messages = [['Have You Met B.O.B?', ['Have You Met', 'B.O.B?']], ['Meet B.O.B Today', ['Meet B.O.B', 'Today']]];
  const materials = messages.map(([, lines]) => {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 800;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#101b25'; ctx.fillRect(0, 0, 1024, 800);
    ctx.strokeStyle = '#bfa260'; ctx.lineWidth = 6; ctx.strokeRect(30, 30, 964, 740);
    ctx.fillStyle = '#bfa260'; ctx.textAlign = 'center'; ctx.font = 'bold 46px sans-serif'; ctx.fillText('B.O.B. BUILDER', 512, 150);
    ctx.fillStyle = '#f4f6f7'; ctx.font = 'bold 112px sans-serif'; ctx.fillText(lines[0], 512, 365, 910);
    ctx.fillStyle = '#f2d17a'; ctx.font = 'bold 154px sans-serif'; ctx.fillText(lines[1], 512, 555, 910);
    ctx.strokeStyle = '#51636f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(160, 660); ctx.lineTo(864, 660); ctx.stroke();
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
    return new THREE.MeshStandardMaterial({ map, metalness: .15, roughness: .55 });
  });
  return robot => messages.forEach(([message], index) => {
    const panel = new THREE.Group(); panel.name = message; panel.position.set(0, 2.05, index ? -.565 : .28); panel.rotation.y = index ? Math.PI : 0;
    panel.add(new THREE.Mesh(frame, trim)); const print = new THREE.Mesh(face, materials[index]); print.position.z = .02; panel.add(print); robot.add(panel);
  });
}