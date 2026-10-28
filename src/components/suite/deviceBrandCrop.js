// Keep the supplied chrome mark intact, removing only connected white backdrop.
export const DEVICE_LOGO_URL = 'https://media.base44.com/images/public/6a19363c90f06323c4cfff73/690214aa8_altxlogo2.jpeg';
let croppedLogo;
export default function deviceBrandCrop() {
  croppedLogo ??= new Promise((resolve, reject) => {
    const image = new Image(); image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas'); canvas.width = 812; canvas.height = 520;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(image, image.naturalWidth * 110 / 1024, image.naturalHeight * 250 / 1024,
        image.naturalWidth * 812 / 1024, image.naturalHeight * 520 / 1024, 0, 0, 812, 520);
      const frame = ctx.getImageData(0, 0, 812, 520), pixels = frame.data;
      const seen = new Uint8Array(812 * 520), queue = new Int32Array(812 * 520);
      let head = 0, tail = 0;
      const visit = index => {
        if (seen[index]) return;
        seen[index] = 1;
        const p = index * 4;
        if (Math.min(pixels[p], pixels[p + 1], pixels[p + 2]) < 238) return;
        queue[tail++] = index;
      };
      for (let x = 0; x < 812; x++) { visit(x); visit(519 * 812 + x); }
      for (let y = 0; y < 520; y++) { visit(y * 812); visit(y * 812 + 811); }
      while (head < tail) {
        const index = queue[head++], x = index % 812, y = Math.floor(index / 812);
        pixels[index * 4 + 3] = 0;
        if (x > 0) visit(index - 1); if (x < 811) visit(index + 1);
        if (y > 0) visit(index - 812); if (y < 519) visit(index + 812);
      }
      ctx.putImageData(frame, 0, 0); resolve(canvas);
    };
    image.onerror = () => reject(new Error('Device logo could not be loaded'));
    image.src = DEVICE_LOGO_URL;
  });
  return croppedLogo;
}