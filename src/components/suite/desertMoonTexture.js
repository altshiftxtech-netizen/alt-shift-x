import * as THREE from 'three';

export default function desertMoonTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const pixels = ctx.createImageData(canvas.width, canvas.height);
  let seed = 73;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const u = x / canvas.width * Math.PI * 2, v = y / canvas.height * Math.PI;
      const terrain = Math.sin(u * 8 + Math.cos(v * 7)) * Math.sin(v * 11 - u * 3);
      const detail = Math.sin(u * 47 + v * 31) * Math.cos(v * 67 - u * 23);
      const shade = 158 + terrain * 27 + detail * 8 + (random() - .5) * 17;
      const i = (y * canvas.width + x) * 4;
      pixels.data[i] = shade; pixels.data[i + 1] = shade; pixels.data[i + 2] = shade;
      pixels.data[i + 3] = 255;
    }
  }
  ctx.putImageData(pixels, 0, 0);
  for (let i = 0; i < 240; i++) {
    const x = random() * canvas.width, y = random() * canvas.height;
    const radius = 2 + Math.pow(random(), 2.8) * 34;
    const crater = ctx.createRadialGradient(x - radius * .2, y - radius * .25, 0, x, y, radius);
    crater.addColorStop(0, 'rgba(30,38,45,.38)');
    crater.addColorStop(.65, 'rgba(46,51,58,.25)');
    crater.addColorStop(.83, 'rgba(230,235,238,.3)');
    crater.addColorStop(1, 'rgba(180,190,198,0)');
    ctx.fillStyle = crater; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}