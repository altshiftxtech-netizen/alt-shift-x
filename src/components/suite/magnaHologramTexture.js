import * as THREE from 'three';

// Isolate the proprietary circuit-M emblem; its wordmark remains real HTML text.
export default function magnaHologramTexture(image) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const context = canvas.getContext('2d');
  context.fillStyle = '#000000';
  context.fillRect(0, 0, 1024, 1024);
  const width = image.naturalWidth || image.width, height = image.naturalHeight || image.height;
  context.drawImage(image, width * .31, height * .18, width * .40, height * .37, 170, 185, 684, 633);
  const pixels = context.getImageData(0, 0, 1024, 1024);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const light = Math.max(pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]);
    const mask = THREE.MathUtils.smoothstep(light, 38, 65);
    pixels.data[i] *= mask;
    pixels.data[i + 1] *= mask;
    pixels.data[i + 2] *= mask;
  }
  context.putImageData(pixels, 0, 0);
  return new THREE.CanvasTexture(canvas);
}