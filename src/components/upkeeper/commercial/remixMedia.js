import { seekReferenceFrame, waitForVideo } from '@/components/upkeeper/referencePlayback';
import opticalCutMetrics from '@/components/upkeeper/commercial/opticalCutMetrics';

export const closeVideo = video => { video.pause(); video.removeAttribute('src'); video.load(); };
export function openVideo(url) {
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous'; video.muted = true; video.playsInline = true; video.preload = 'auto';
  const ready = waitForVideo(video, 'loadeddata');
  video.src = url;
  return { video, ready };
}

export default async function remixMedia(url, name) {
  const { video, ready } = openVideo(url);
  try {
    await ready;
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration < 1 || !video.videoWidth) throw new Error('Choose a playable video at least one second long.');
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 72;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const count = Math.min(43, Math.max(13, Math.ceil(duration * 3) + 1));
    const thumbs = [], samples = [];
    const thumbIndices = new Set(Array.from({ length: 6 }, (_, i) => Math.round(i * (count - 1) / 5)));
    let previous, lastCut = 0;
    for (let i = 0; i < count; i++) {
      const time = (duration - .05) * i / (count - 1);
      await seekReferenceFrame(video, time);
      ctx.drawImage(video, 0, 0, 128, 72);
      const pixels = ctx.getImageData(0, 0, 128, 72).data;
      const luminance = new Uint8Array(pixels.length / 4);
      let sum = 0, square = 0;
      for (let j = 0; j < luminance.length; j++) {
        const k = j * 4, v = luminance[j] = pixels[k] * .21 + pixels[k + 1] * .72 + pixels[k + 2] * .07;
        sum += v; square += v * v;
      }
      const { motion, cut } = opticalCutMetrics(luminance, previous, 128, 72);
      const contrast = Math.sqrt(Math.max(0, square / luminance.length - (sum / luminance.length) ** 2));
      if (cut && time - lastCut > .55) lastCut = time;
      samples.push({ time, start: Math.max(lastCut, time - .55), motion, contrast });
      if (thumbIndices.has(i)) thumbs.push(canvas.toDataURL('image/jpeg', .72));
      previous = luminance;
    }
    return { url, name, duration, thumbs, samples };
  } finally { closeVideo(video); }
}