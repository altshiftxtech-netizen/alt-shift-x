import { closeVideo, openVideo } from '@/components/upkeeper/commercial/remixMedia';
import { seekReferenceFrame } from '@/components/upkeeper/referencePlayback';

export default function remixPlayback(remix) {
  if (!remix) return null;
  const slots = [{}, {}];
  let disposed = false;
  const indexAt = t => Math.max(0, remix.shots.findLastIndex(shot => shot.at <= t));
  const details = (i, t) => {
    const shot = remix.shots[i], { source, start, span } = remix.candidates[shot.choice];
    const end = Math.min(source.duration, start + span) - .03;
    const rate = Math.max(.25, Math.min(1, (end - start) / shot.length));
    return { source, rate, end, time: Math.min(end, start + Math.max(0, t - shot.at) * rate) };
  };
  const prepare = (i, t) => {
    if (disposed) return Promise.resolve();
    const slot = slots[i % 2], { source, time, rate } = details(i, t);
    if (slot.index === i && slot.pending) return slot.pending;
    if (slot.url !== source.url) {
      if (slot.video) closeVideo(slot.video);
      Object.assign(slot, openVideo(source.url), { url: source.url });
    }
    slot.index = i; slot.error = null;
    const video = slot.video;
    video.pause();
    const pending = slot.ready.then(async () => {
      if (disposed || slot.pending !== pending) return;
      video.playbackRate = rate;
      await seekReferenceFrame(video, time);
      return video;
    }).catch(error => { if (slot.pending === pending) slot.error = error; throw error; })
      .finally(() => { if (slot.pending === pending) slot.pending = null; });
    slot.pending = pending;
    return pending;
  };
  const pause = () => slots.forEach(slot => slot.video?.pause());
  return {
    pause,
    dispose() { disposed = true; slots.forEach(slot => { if (slot.video) closeVideo(slot.video); }); },
    async seek(t) {
      pause();
      const i = indexAt(t), slot = slots[i % 2];
      if (slot.pending && slot.index === i) await slot.pending;
      return prepare(i, t);
    },
    async warm(t = 0) {
      const i = indexAt(t), next = remix.shots[i + 1];
      await Promise.all([prepare(i, t), next && prepare(i + 1, next.at)]);
    },
    frame(t) {
      const i = indexAt(t), slot = slots[i % 2], other = slots[(i + 1) % 2], next = remix.shots[i + 1];
      if (slot.index !== i) { void prepare(i, t).catch(() => {}); return null; }
      if (slot.error) throw slot.error;
      if (slot.pending || slot.video.readyState < 2) return null;
      const { end, time } = details(i, t), video = slot.video;
      if (Math.abs(video.currentTime - time) > .32) { void prepare(i, t).catch(() => {}); return null; }
      if (time < end - .01 && video.paused && !video.ended) void video.play().catch(() => {});
      if (time >= end - .01) video.pause();
      if (next && other.index !== i + 1) void prepare(i + 1, next.at).catch(() => {});
      else if (!next) other.video?.pause();
      return video;
    },
  };
}