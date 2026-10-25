import * as THREE from 'three';

export default function desertGroundTexture(surface = false, anisotropy = 8, compact = false) {
  const size = compact || window.innerWidth < 1100 ? 1024 : 1536;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  const image = context.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size * Math.PI * 2, v = y / size * Math.PI * 2;
      const ripples = Math.sin(u * 24 + Math.sin(v * 3) * 2.6 + v * 8);
      const strata = Math.sin(u * 7 - v * 11 + Math.sin(v * 5)) * 12;
      const grit = Math.sin(u * 137 - v * 89) * 6 + (Math.random() - .5) * 18;
      const seams = Math.pow(1 - Math.abs(Math.sin(u * 5 + Math.sin(v * 4) * 2)), 22) * 24;
      const weathering = Math.sin(u * 13 + Math.cos(v * 9) * 2) * Math.cos(v * 17 - u * 4);
      const value = surface ? 215 + ripples * 4 + strata * .35 + grit * .65 + weathering * 9 - seams * .65 : 128 + ripples * 14 + strata * .6 + grit + weathering * 12 - seams;
      const index = (y * size + x) * 4;
      image.data[index] = image.data[index + 1] = image.data[index + 2] = value;
      image.data[index + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(24, 24);
  texture.anisotropy = anisotropy;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  if (surface) texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}