// Export presets: social packages, short-form verticals and a looping GIF.

import JSZip from 'jszip';
import { downloadAsset } from '@/components/upkeeper/creativeAssets';
import { totalSeconds } from '@/components/upkeeper/commercial/directorPlan';

const stamp = () => new Date().toISOString().slice(0, 10);

const clock = (seconds) => {
  const s = Math.max(0, seconds);
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(Math.floor(s % 60)).padStart(2, '0');
  const ms = String(Math.round((s % 1) * 1000)).padStart(3, '0');
  return `${hh}:${mm}:${ss},${ms}`;
};

export function buildSrt(plan) {
  let cursor = 0;
  const cues = (plan.beats || []).map((beat, i) => {
    const start = cursor;
    const duration = Number(plan.durations?.[i] || 0);
    cursor += duration;
    const text = (beat.words || []).map((w) => w.w).join(' ') || beat.voiceover || beat.headline || '';
    return `${i + 1}\n${clock(start)} --> ${clock(start + Math.max(0.6, duration - 0.05))}\n${text}\n`;
  });
  return cues.join('\n');
}

export function buildPost(plan, { vertical = false } = {}) {
  const title = plan.social?.title || plan.wordmark || 'Commercial';
  const body = plan.social?.body || plan.prompt || '';
  const tags = vertical ? '#reels #shorts #buildinpublic' : '#engineering #hardware #opensource';
  return [
    `# ${title}`,
    '',
    body,
    '',
    '---',
    '',
    `Rendered with UpKeeper Commercial Maker · ${totalSeconds(plan)}s · ${plan.aspect}${vertical ? ' · vertical cut' : ''}`,
    '',
    tags,
    '',
  ].join('\n');
}

const videoName = (plan, tag) => `${tag}-${plan.aspect.replace(':', 'x')}-${stamp()}.`;

export async function downloadSocialPackage({ plan, reel }) {
  const zip = new JSZip();
  zip.file(`${videoName(plan, 'commercial')}${reel.extension}`, reel.blob);
  zip.file('post.md', buildPost(plan));
  zip.file('captions.srt', buildSrt(plan));
  zip.file(
    'README.txt',
    [
      'Reddit / X package',
      '',
      `Video: ${reel.width}×${reel.height}, ${reel.seconds}s, ${reel.extension.toUpperCase()}.`,
      'post.md holds the title and body copy. captions.srt is the matching subtitle track.',
      '',
      'Captions are burned into the picture as well, so the clip is readable muted.',
    ].join('\n')
  );
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadAsset(blob, `upkeeper-reddit-x-${stamp()}.zip`);
  return blob;
}

export async function downloadVerticalPackage({ plan, reel }) {
  const zip = new JSZip();
  zip.file(`${videoName(plan, 'reel')}${reel.extension}`, reel.blob);
  zip.file('captions.srt', buildSrt(plan));
  zip.file('post.md', buildPost(plan, { vertical: true }));
  zip.file(
    'README.txt',
    [
      'Shorts / Reels package',
      '',
      `Video: ${reel.width}×${reel.height}, ${reel.seconds}s, ${reel.extension.toUpperCase()}.`,
      'High-viz captions are burned in — safe to post with sound off.',
      'captions.srt is provided for platforms that accept an uploadable track.',
    ].join('\n')
  );
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadAsset(blob, `upkeeper-shorts-reels-${stamp()}.zip`);
  return blob;
}

export async function downloadGifPackage(plan, gif) {
  const zip = new JSZip();
  zip.file(`commercial-${gif.width}x${gif.height}.gif`, gif.blob);
  zip.file('post.md', buildPost(plan).replace(`${totalSeconds(plan)}s`, `${gif.seconds}s looping GIF`));
  downloadAsset(await zip.generateAsync({ type: 'blob' }), `upkeeper-community-${stamp()}.zip`);
}

export async function downloadCinemaPackage(reel, stems) {
  const zip = new JSZip();
  zip.file(`master-${reel.width}x${reel.height}.${reel.extension}`, reel.blob);
  for (const [name, blob] of Object.entries(stems)) zip.file(`audio/${name}`, blob);
  zip.file('README.txt', 'The MP4 contains the stereo mix. Audio includes a 24-bit / 48 kHz mix and four separate timeline-aligned WAV stems. The 60 fps capture target depends on browser and hardware performance.');
  downloadAsset(await zip.generateAsync({ type: 'blob' }), `upkeeper-cinema-4k-${stamp()}.zip`);
}

export const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;