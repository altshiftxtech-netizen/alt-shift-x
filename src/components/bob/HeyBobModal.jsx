import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Mic, Video, X, Loader2, Square, RotateCcw, Send, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * HeyBobModal — the "Hey BOB" landing gate.
 *
 * A single overlay that offers BOB's three live-capture capabilities and, when
 * done, hands the captured input straight back to the SAME chat the user was
 * gated here from (via onCapture(text, file_urls)). onClose returns them to
 * that chat untouched.
 *
 *   • BOB Look   — snap a photo, sent straight to BOB (existing behavior).
 *   • BOB Listen — record audio in short chunks; each chunk is transcribed the
 *                  moment it's captured (low latency) and fed to BOB to build.
 *   • BOB Watch  — record a short video, uploaded and sent straight to prompt.
 *
 * All three work across devices: mobile uses the native camera/mic capture,
 * desktop uses getUserMedia. Uploads/transcription run per-chunk so BOB starts
 * working with near-zero perceived latency instead of waiting for one big file.
 */

const LOOK_MSG =
  "Bob Look — analyze this photo. Read every visible title/label in the image, including the focused item AND any " +
  "books, products, or documents on the surrounding shelves or background. List what you see, then tell me what we can build or do with it.";

const WATCH_MSG =
  "Bob Watch — analyze this video. Describe everything happening and every visible label/title/object across the frames, " +
  "then tell me what components we can build or what we can do with it.";

// Short audio slices → transcribe each as it lands, so BOB gets a running feed
// with minimal latency instead of one long upload at the end.
const AUDIO_CHUNK_MS = 4000;

function ModeCard({ icon: Icon, title, desc, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start text-left gap-2 rounded-2xl border border-slate-700 hover:border-violet-500 bg-slate-800/70 hover:bg-slate-800 p-5 transition-all"
    >
      <span
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: `${accent}22`, border: `1px solid ${accent}55` }}
      >
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </span>
      <span className="text-base font-bold text-white">{title}</span>
      <span className="text-xs text-slate-400 leading-relaxed">{desc}</span>
    </button>
  );
}

export default function HeyBobModal({ open, onClose, onCapture }) {
  const [mode, setMode] = useState(null); // null | look | listen | watch
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  // Listen
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const listenRecorderRef = useRef(null);
  const listenStreamRef = useRef(null);
  const transcriptRef = useRef("");

  // Watch
  const [recordingVideo, setRecordingVideo] = useState(false);
  const [videoBlobUrl, setVideoBlobUrl] = useState(null);
  const videoPreviewRef = useRef(null);
  const videoRecorderRef = useRef(null);
  const videoStreamRef = useRef(null);
  const videoChunksRef = useRef([]);
  const videoFileRef = useRef(null);

  const lookInputRef = useRef(null);

  const resetLocal = useCallback(() => {
    setMode(null);
    setBusy(false);
    setStatus("");
    setListening(false);
    setTranscript("");
    transcriptRef.current = "";
    setRecordingVideo(false);
    if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
    setVideoBlobUrl(null);
    videoChunksRef.current = [];
    videoFileRef.current = null;
  }, [videoBlobUrl]);

  // Stop any live media when the modal closes or mode changes.
  const stopAllStreams = useCallback(() => {
    listenRecorderRef.current?.state === "recording" && listenRecorderRef.current.stop();
    videoRecorderRef.current?.state === "recording" && videoRecorderRef.current.stop();
    listenStreamRef.current?.getTracks().forEach((t) => t.stop());
    videoStreamRef.current?.getTracks().forEach((t) => t.stop());
    listenStreamRef.current = null;
    videoStreamRef.current = null;
  }, []);

  useEffect(() => {
    if (!open) { stopAllStreams(); resetLocal(); }
    return () => stopAllStreams();
  }, [open, stopAllStreams, resetLocal]);

  const finishAndReturn = (text, file_urls) => {
    stopAllStreams();
    onCapture?.(text, file_urls);
    resetLocal();
  };

  // ── BOB Look ────────────────────────────────────────────────────────────────
  const handleLookFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setStatus("Sending your photo to BOB…");
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    finishAndReturn(LOOK_MSG, [file_url]);
  };

  // ── BOB Listen (chunked, low-latency transcription) ──────────────────────────
  const startListening = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    listenStreamRef.current = stream;
    const recorder = new MediaRecorder(stream);
    listenRecorderRef.current = recorder;
    setTranscript("");
    transcriptRef.current = "";

    // Each timeslice fires ondataavailable → upload+transcribe that slice alone.
    recorder.ondataavailable = async (e) => {
      if (!e.data || e.data.size < 1200) return;
      try {
        const file = new File([e.data], "chunk.webm", { type: "audio/webm" });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const text = await base44.integrations.Core.TranscribeAudio({ audio_url: file_url });
        if (text && text.trim()) {
          transcriptRef.current = (transcriptRef.current + " " + text.trim()).trim();
          setTranscript(transcriptRef.current);
        }
      } catch { /* skip a bad slice, keep listening */ }
    };
    recorder.start(AUDIO_CHUNK_MS);
    setListening(true);
  };

  const stopListening = () => {
    listenRecorderRef.current?.state === "recording" && listenRecorderRef.current.stop();
    listenStreamRef.current?.getTracks().forEach((t) => t.stop());
    setListening(false);
  };

  const sendListen = () => {
    const t = transcriptRef.current.trim();
    if (!t) return;
    finishAndReturn(
      `Bob Listen — here's what I said, build from it:\n\n"${t}"\n\nTurn this into component(s): propose the type (X1/X2/X4), name, and a build plan, then build it.`
    );
  };

  // ── BOB Watch ────────────────────────────────────────────────────────────────
  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }, audio: true,
    });
    videoStreamRef.current = stream;
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = stream;
      videoPreviewRef.current.play().catch(() => {});
    }
    const recorder = new MediaRecorder(stream);
    videoRecorderRef.current = recorder;
    videoChunksRef.current = [];
    recorder.ondataavailable = (e) => e.data.size && videoChunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(videoChunksRef.current, { type: "video/webm" });
      videoFileRef.current = new File([blob], "bob-watch.webm", { type: "video/webm" });
      setVideoBlobUrl(URL.createObjectURL(blob));
      videoStreamRef.current?.getTracks().forEach((t) => t.stop());
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
    };
    recorder.start();
    setRecordingVideo(true);
  };

  const stopVideo = () => {
    videoRecorderRef.current?.state === "recording" && videoRecorderRef.current.stop();
    setRecordingVideo(false);
  };

  const retakeVideo = () => {
    if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
    setVideoBlobUrl(null);
    videoFileRef.current = null;
  };

  const sendVideo = async () => {
    if (!videoFileRef.current) return;
    setBusy(true);
    setStatus("Uploading your video to BOB…");
    const { file_url } = await base44.integrations.Core.UploadFile({ file: videoFileRef.current });
    finishAndReturn(WATCH_MSG, [file_url]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
          <img src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/10a720a09_generated_image.png" className="w-9 h-9 rounded-full object-cover" alt="BOB" />
          <div className="flex-1">
            <p className="text-sm font-black text-white leading-none">Hey BOB</p>
            <p className="text-[11px] text-slate-400 mt-1">Show, tell, or record — BOB turns it into components.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {busy && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
              <p className="text-sm text-slate-300">{status}</p>
            </div>
          )}

          {/* Mode chooser */}
          {!busy && !mode && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ModeCard icon={Camera} title="BOB Look" accent="#a78bfa"
                desc="Snap a photo. BOB reads every label and tells you what to build."
                onClick={() => lookInputRef.current?.click()} />
              <ModeCard icon={Mic} title="BOB Listen" accent="#34d399"
                desc="Talk it out. BOB transcribes as you speak and builds the components."
                onClick={() => setMode("listen")} />
              <ModeCard icon={Video} title="BOB Watch" accent="#f59e0b"
                desc="Record a short video sent straight to BOB as your prompt."
                onClick={() => setMode("watch")} />
              <input ref={lookInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleLookFile} />
            </div>
          )}

          {/* Listen */}
          {!busy && mode === "listen" && (
            <div className="space-y-4">
              <button onClick={() => { stopListening(); setMode(null); }} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${listening ? "border-emerald-500 bg-emerald-500/10 animate-pulse" : "border-slate-600 bg-slate-800"}`}>
                  <Mic className={`w-8 h-8 ${listening ? "text-emerald-400" : "text-slate-400"}`} />
                </div>
                <p className="text-xs text-slate-400">{listening ? "Listening… speak naturally, BOB transcribes live." : "Tap to start talking."}</p>
                {!listening ? (
                  <button onClick={startListening} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2">
                    <Mic className="w-4 h-4" /> Start Listening
                  </button>
                ) : (
                  <button onClick={stopListening} className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2">
                    <Square className="w-4 h-4" /> Stop
                  </button>
                )}
              </div>
              {transcript && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 max-h-32 overflow-y-auto">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Live transcript</p>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{transcript}</p>
                </div>
              )}
              <button onClick={sendListen} disabled={!transcript.trim() || listening} className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Send to BOB
              </button>
            </div>
          )}

          {/* Watch */}
          {!busy && mode === "watch" && (
            <div className="space-y-4">
              <button onClick={() => { stopVideo(); retakeVideo(); setMode(null); }} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <div className="rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                {videoBlobUrl ? (
                  <video src={videoBlobUrl} controls className="w-full h-full object-contain" />
                ) : (
                  <video ref={videoPreviewRef} muted playsInline className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex items-center justify-center gap-2">
                {!videoBlobUrl && !recordingVideo && (
                  <button onClick={startVideo} className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2">
                    <Video className="w-4 h-4" /> Start Recording
                  </button>
                )}
                {recordingVideo && (
                  <button onClick={stopVideo} className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 animate-pulse">
                    <Square className="w-4 h-4" /> Stop Recording
                  </button>
                )}
                {videoBlobUrl && (
                  <>
                    <button onClick={retakeVideo} className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" /> Retake
                    </button>
                    <button onClick={sendVideo} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2">
                      <Send className="w-4 h-4" /> Send to BOB
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}