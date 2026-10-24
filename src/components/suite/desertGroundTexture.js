import * as THREE from 'three';

export default function desertGroundTexture(surface = false) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  const image = context.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size * Math.PI * 2, v = y / size * Math.PI * 2;
      const ripples = Math.sin(u * 12 + Math.sin(v * 3) * 1.6 + v * 4);
      const grit = Math.sin(u * 37 - v * 19) * 8 + (Math.random() - .5) * 22;
      const value = surface ? 215 + ripples * 30 + grit * .9 : 128 + ripples * 40 + grit * 1.3;
      const index = (y * size + x) * 4;
      image.data[index] = image.data[index + 1] = image.data[index + 2] = value;
      image.data[index + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(32, 32);
  texture.anisotropy = 4;
  return texture;
}