// Renders the director plan to a real, playable file: canvas frames plus the
// three-bus mix captured through MediaRecorder on one shared clock.

import { cinemaCodec } from '@/components/upkeeper/cinemaCapture';
import resumeAudioContext from '@/components/upkeeper/audio/resumeAudioContext';
import recordCinemaStream from '@/components/upkeeper/recordCinemaStream';
import validateCinemaRecording from '@/components/upkeeper/validateCinemaRecording';
import { paintDirectorFrame, stageSize } from '@/components/upkeeper/commercial/directorPaint';
import { buildDirectorAudio, decodeVoices } from '@/components/upkeeper/commercial/directorAudio';
import { totalSeconds } from '@/components/upkeeper/commercial/directorPlan';
import { quantise, createGifEncoder } from '@/components/upkeeper/commercial/gifEncoder';
import { releaseCinemaGrade } from '@/components/upkeeper/commercial/cinemaGrade';
import remixPlayback from '@/components/upkeeper/commercial/remixPlayback';

function makeCanvas(plan, shortEdge) {
  const { width, height } = stageSize(plan.aspect, shortEdge);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function supportedFormats() {
  return { mp4: Boolean(cinemaCodec('mp4')), webm: Boolean(cinemaCodec('webm')) };
}

/**
 * Record the whole commercial. Real-time: a 30s spot takes about 30s to encode.
 */
export async function renderCommercial({
  plan,
  assets = {},
  shortEdge = 1080,
  format = 'mp4',
  voiceUrls = [],
  levels,
  score,
  fps = 30,
  videoBitsPerSecond,
  strictFormat = false,
  onProgress = () => {},
  signal,
}) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) throw new Error('This browser cannot capture synchronized audio.');
  const mime = cinemaCodec(format) || (!strictFormat && cinemaCodec('webm'));
  if (!mime) throw new Error('This browser cannot encode video. Use a current desktop Chrome or Edge.');

  const canvas = makeCanvas(plan, shortEdge);
  const context = new AudioContext({ sampleRate: 48000 });
  const destination = context.createMediaStreamDestination();
  const videoStream = canvas.captureStream(fps);
  const stream = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...destination.stream.getAudioTracks(),
  ]);

  let audio = null;
  const footage = remixPlayback(plan.remix);
  try {
    const voiceBuffers = await decodeVoices(context, voiceUrls);
    audio = buildDirectorAudio(context, destination, { plan, voiceBuffers, levels, score });
    await resumeAudioContext(context, signal);
    if (signal?.aborted) throw new Error('Render cancelled.');

    const seconds = totalSeconds(plan);
    await footage?.warm();
    const firstFrame = await footage?.seek(0);
    paintDirectorFrame(canvas, 0, plan, { ...assets, referenceFrame: firstFrame });
    const paint = async (time) => {
      const referenceFrame = footage?.frame(time);
      if (!footage || referenceFrame) paintDirectorFrame(canvas, time, plan, { ...assets, referenceFrame });
    };

    const result = await recordCinemaStream({
      capture: { stream, context },
      mime,
      width: canvas.width,
      seconds,
      clip: null,
      withAudio: true,
      startAudio: (time) => audio.start(time),
      paint,
      onProgress,
      videoBitsPerSecond,
      signal,
    });

    if (signal?.aborted) throw new Error('Render cancelled.');
    await validateCinemaRecording(result.blob, canvas.width, canvas.height);
    return {
      ...result,
      width: canvas.width,
      height: canvas.height,
      seconds,
      extension: mime.includes('mp4') ? 'mp4' : 'webm',
      hasAudio: Boolean(voiceBuffers.filter(Boolean).length),
    };
  } finally {
    footage?.dispose();
    audio?.stop();
    stream.getTracks().forEach((track) => track.stop());
    videoStream.getTracks().forEach((track) => track.stop());
    releaseCinemaGrade(canvas);
    canvas.width = canvas.height = 1;
    if (context.state !== 'closed') void context.close();
  }
}

/**
 * A 15-second looping GIF. Frames are quantised as they are drawn so the whole
 * clip never has to sit in memory as RGBA.
 */
export async function renderGif({
  plan,
  assets = {},
  shortEdge = 540,
  fps = 12,
  seconds = 15,
  onProgress = () => {},
  signal,
}) {
  const canvas = makeCanvas(plan, shortEdge);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const clip = Math.min(seconds, totalSeconds(plan));
  const frames = Math.max(2, Math.round(clip * fps));
  const encoder = createGifEncoder(canvas.width, canvas.height, fps);
  const footage = remixPlayback(plan.remix);
  try {
    for (let i = 0; i < frames; i += 1) {
      if (signal?.aborted) throw new Error('GIF cancelled.');
      const time = (i / frames) * clip;
      const referenceFrame = await footage?.seek(time);
      paintDirectorFrame(canvas, time, plan, { ...assets, referenceFrame });
      encoder.add(quantise(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height));
      onProgress(Math.round(((i + 1) / frames) * 99));
      if (i % 2 === 0) await new Promise((resolve) => setTimeout(resolve, 0));
    }
    const blob = encoder.finish();
    onProgress(100);
    return { blob, width: canvas.width, height: canvas.height, seconds: clip, fps, frames };
  } finally {
    footage?.dispose();
    releaseCinemaGrade(canvas);
    canvas.width = canvas.height = 1;
  }
}