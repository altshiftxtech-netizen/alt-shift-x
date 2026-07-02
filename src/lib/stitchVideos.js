// Browser-side video stitcher. Plays an ordered list of video segments one
// after another into a canvas and records the composite with MediaRecorder,
// producing a single continuous video — works for any number of segments and
// any total length. Audio from each segment is piped through so the final
// video keeps its sound.
//
// Returns a Blob (webm) of the stitched video.

const pickMimeType = () => {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || "video/webm";
};

const loadVideo = (url) =>
  new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.crossOrigin = "anonymous";
    v.src = url;
    v.muted = false;
    v.playsInline = true;
    v.preload = "auto";
    v.onloadedmetadata = () => resolve(v);
    v.onerror = () => reject(new Error("Could not load a segment video."));
  });

// stitch(urls, { onProgress }) -> Blob
export async function stitchVideos(urls, { onProgress } = {}) {
  if (!urls?.length) throw new Error("No segments to stitch.");

  // Load all segments up front so we know dimensions and can play instantly.
  const videos = [];
  for (let i = 0; i < urls.length; i++) {
    videos.push(await loadVideo(urls[i]));
    onProgress?.({ phase: "loading", index: i + 1, total: urls.length });
  }

  // Canvas sized to the first segment (all model segments share the ratio).
  const width = videos[0].videoWidth || 1280;
  const height = videos[0].videoHeight || 720;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Composite video track from the canvas.
  const canvasStream = canvas.captureStream(30);

  // Composite audio: route every segment's audio through one destination so the
  // recorder captures a continuous soundtrack.
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();
  const audioDest = audioCtx.createMediaStreamDestination();
  const sources = videos.map((v) => {
    const src = audioCtx.createMediaElementSource(v);
    src.connect(audioDest);
    return src;
  });

  const mixedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioDest.stream.getAudioTracks(),
  ]);

  const recorder = new MediaRecorder(mixedStream, { mimeType: pickMimeType() });
  const chunks = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

  const finished = new Promise((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
  });

  recorder.start();

  // Draw loop — keeps painting the current segment's frame to the canvas.
  let current = null;
  let rafId = null;
  const draw = () => {
    if (current && !current.paused && !current.ended) {
      ctx.drawImage(current, 0, 0, width, height);
    }
    rafId = requestAnimationFrame(draw);
  };
  draw();

  const playSegment = (v, i) =>
    new Promise((resolve) => {
      current = v;
      v.currentTime = 0;
      onProgress?.({ phase: "stitching", index: i + 1, total: videos.length });
      const onEnded = () => {
        v.removeEventListener("ended", onEnded);
        resolve();
      };
      v.addEventListener("ended", onEnded);
      v.play().catch(() => resolve());
    });

  // Play each segment to completion, in order.
  for (let i = 0; i < videos.length; i++) {
    await playSegment(videos[i], i);
  }

  cancelAnimationFrame(rafId);
  recorder.stop();
  const blob = await finished;

  // Cleanup
  try {
    sources.forEach((s) => s.disconnect());
    audioCtx.close();
  } catch { /* ignore */ }

  return blob;
}