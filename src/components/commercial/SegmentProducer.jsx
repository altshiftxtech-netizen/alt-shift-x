import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { stitchVideos } from "@/lib/stitchVideos";
import {
  Loader2, Sparkles, Film, RefreshCw, Check, Layers, Play, Combine, Clock, ThumbsUp, X,
} from "lucide-react";

// Multi-segment video producer. The agent decomposes the brief into an ordered
// sequence of ~8s segments, each is generated individually, the operator can
// review/regenerate any segment, then everything is stitched — in order — into
// one continuous video. Any number of segments, any total length.
export default function SegmentProducer({ brief, platform, aspect, brand, onStitched }) {
  const [targetSeconds, setTargetSeconds] = useState(24);
  const [segments, setSegments] = useState([]); // { label, prompt, media_url, generating }
  const [planning, setPlanning] = useState(false);
  const [genAllRunning, setGenAllRunning] = useState(false);
  const [stitching, setStitching] = useState(false);
  const [stitchProgress, setStitchProgress] = useState(null);
  const [finalUrl, setFinalUrl] = useState("");
  const [error, setError] = useState("");
  // Approval gate — segments only auto-connect once the operator has reviewed
  // every clip and explicitly confirmed they're satisfied.
  const [reviewing, setReviewing] = useState(false);

  const estCount = Math.max(2, Math.ceil(targetSeconds / 8));
  const allRendered = segments.length > 0 && segments.every((s) => s.media_url);

  const planSegments = async () => {
    if (!brief?.trim()) return;
    setPlanning(true); setError(""); setSegments([]); setFinalUrl("");
    try {
      // Long films are planned in chunks of ~80s (10 segments) per LLM call so a
      // single request never has to emit dozens of detailed prompts (which
      // truncate/degrade). Chunks are merged in order into one continuous plan.
      const CHUNK = 80; // seconds per planning call
      const all = [];
      for (let start = 0; start < targetSeconds; start += CHUNK) {
        const remaining = targetSeconds - start;
        const chunkSeconds = Math.min(CHUNK, remaining);
        // eslint-disable-next-line no-await-in-loop
        const res = await base44.functions.invoke("commercialStudioPlan", {
          action: "segments", brief, platform, brand,
          target_seconds: chunkSeconds,
          part_index: Math.floor(start / CHUNK),
          part_start_seconds: start,
          total_seconds: targetSeconds,
          continues_from: all.length ? all[all.length - 1].prompt : "",
        });
        if (res.data?.error) { setError(res.data.error); break; }
        (res.data.segments || []).forEach((s) => all.push(s));
        setSegments(all.map((s) => ({ ...s, media_url: "", generating: false })));
      }
    } catch (err) {
      setError(err.message || "Could not plan segments.");
    } finally {
      setPlanning(false);
    }
  };

  const generateOne = async (idx) => {
    setSegments((prev) => prev.map((s, i) => (i === idx ? { ...s, generating: true } : s)));
    try {
      const res = await base44.integrations.Core.GenerateVideo({
        prompt: `${segments[idx].prompt}\nVISUALS ONLY: no text, captions, lettering, watermarks or typography. Exact titles are added as vector overlays in post-production.`, aspect_ratio: aspect, duration: 8, generate_audio:false,
      });
      const url = res?.url || res?.video_url || "";
      setSegments((prev) => prev.map((s, i) => (i === idx ? { ...s, media_url: url, generating: false } : s)));
      return !!url;
    } catch {
      setSegments((prev) => prev.map((s, i) => (i === idx ? { ...s, generating: false } : s)));
      return false;
    }
  };

  const generateAll = async () => {
    setGenAllRunning(true); setError("");
    // Sequential — video generation is heavy; one at a time avoids rate limits.
    // Resumable: skips already-rendered segments and CONTINUES past any failure
    // so a single hiccup never loses the whole long-film run. Failed ones are
    // reported at the end and can be retried with their own Regenerate button.
    const failed = [];
    for (let i = 0; i < segments.length; i++) {
      if (!segments[i].media_url) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await generateOne(i);
        if (!ok) failed.push(i + 1);
      }
    }
    if (failed.length) setError(`Segments ${failed.join(", ")} didn't render — retry those, then stitch.`);
    setGenAllRunning(false);
  };

  const stitch = async () => {
    setReviewing(false);
    setStitching(true); setError(""); setStitchProgress(null); setFinalUrl("");
    try {
      const urls = segments.map((s) => s.media_url).filter(Boolean);
      const blob = await stitchVideos(urls, { onProgress: setStitchProgress });
      // Upload the stitched result so it's a permanent URL that can be saved.
      const file = new File([blob], "stitched-production.webm", { type: "video/webm" });
      const up = await base44.integrations.Core.UploadFile({ file });
      const url = up?.file_url || up?.data?.file_url || URL.createObjectURL(blob);
      setFinalUrl(url);
      onStitched?.(url, segments);
    } catch (err) {
      setError(err.message || "Stitching failed. Try regenerating any segment that won't load.");
    } finally {
      setStitching(false);
      setStitchProgress(null);
    }
  };

  return (
    <div className="space-y-3 border border-amber-900/30 rounded-2xl bg-black/20 p-3">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-amber-400" />
        <p className="text-sm font-bold text-amber-50">Multi-Segment Video</p>
        <span className="text-[10px] text-amber-200/40">Generate segments → stitch into one film</span>
      </div>

      {/* Target length */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-amber-200/60">
          <Clock className="w-3.5 h-3.5" /> Target length
        </div>
        <input type="range" min={16} max={600} step={8} value={targetSeconds}
          onChange={(e) => setTargetSeconds(Number(e.target.value))}
          className="flex-1 accent-amber-500" />
        <span className="text-[11px] font-bold text-amber-100 w-28 text-right">
          {Math.floor(targetSeconds / 60)}m {targetSeconds % 60}s · ~{estCount} segs
        </span>
      </div>

      <button onClick={planSegments} disabled={planning || !brief?.trim()}
        className="w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold text-black bg-gradient-to-r from-amber-300 to-amber-500 hover:opacity-90 px-3 py-2 rounded-lg disabled:opacity-50">
        {planning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        Plan {estCount} continuous segments
      </button>

      {error && <p className="text-[11px] text-red-400">{error}</p>}

      {segments.length > 0 && (
        <div className="space-y-2">
          {segments.map((s, i) => (
            <div key={i} className="bg-[#12100f] border border-amber-900/30 rounded-xl p-2.5 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-bold text-black bg-amber-400 rounded-md px-1.5 py-0.5 flex-shrink-0">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-amber-100 truncate">{s.label || `Segment ${i + 1}`}</p>
                  <p className="text-[10px] text-amber-200/50 line-clamp-2">{s.prompt}</p>
                </div>
                {s.media_url && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              </div>

              {s.media_url && (
                <video src={s.media_url} controls className="w-full max-h-40 object-contain bg-black rounded-lg" />
              )}

              <button onClick={() => generateOne(i)} disabled={s.generating || genAllRunning}
                className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-200 bg-black/40 hover:bg-black/60 border border-amber-900/30 px-2 py-1 rounded-lg disabled:opacity-50">
                {s.generating ? <Loader2 className="w-3 h-3 animate-spin" /> : s.media_url ? <RefreshCw className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                {s.generating ? "Rendering…" : s.media_url ? "Regenerate" : "Generate segment"}
              </button>
            </div>
          ))}

          <div className="flex gap-2 pt-1">
            <button onClick={generateAll} disabled={genAllRunning || allRendered}
              className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-black bg-gradient-to-r from-amber-300 to-amber-500 hover:opacity-90 px-3 py-2 rounded-lg disabled:opacity-50">
              {genAllRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {allRendered ? "All segments ready" : "Generate all segments"}
            </button>
            <button onClick={() => { setReviewing(true); setError(""); }} disabled={!allRendered || stitching}
              className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-50 bg-emerald-700 hover:bg-emerald-600 px-3 py-2 rounded-lg disabled:opacity-50">
              {stitching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Combine className="w-3.5 h-3.5" />}
              {stitching ? "Connecting…" : "Review & connect"}
            </button>
          </div>

          {/* Approval gate — auto-connect only runs after the operator confirms
              they're satisfied with all the segments. */}
          {reviewing && !stitching && (
            <div className="border border-emerald-800/50 bg-emerald-950/30 rounded-xl p-3 space-y-2.5">
              <p className="text-[11px] font-bold text-emerald-200 flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5" /> Ready to auto-connect {segments.length} segments
              </p>
              <p className="text-[10px] text-emerald-100/70">
                All {segments.length} segments are rendered and shown above in order. Once you approve, they'll be automatically connected into one continuous {Math.floor(targetSeconds / 60)}m {targetSeconds % 60}s film. Regenerate any segment first if you're not satisfied.
              </p>
              <div className="flex gap-2">
                <button onClick={stitch}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-50 bg-emerald-700 hover:bg-emerald-600 px-3 py-2 rounded-lg">
                  <Check className="w-3.5 h-3.5" /> Approve & connect segments
                </button>
                <button onClick={() => setReviewing(false)}
                  className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-200/70 hover:text-emerald-100 border border-emerald-800/50 px-3 py-2 rounded-lg">
                  <X className="w-3.5 h-3.5" /> Not yet
                </button>
              </div>
            </div>
          )}

          {stitching && stitchProgress && (
            <p className="text-[10px] text-amber-200/60 text-center">
              {stitchProgress.phase === "loading" ? "Loading" : "Stitching"} segment {stitchProgress.index}/{stitchProgress.total}…
            </p>
          )}
        </div>
      )}

      {finalUrl && (
        <div className="space-y-2 border-t border-amber-900/30 pt-3">
          <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Stitched production ready</p>
          <video src={finalUrl} controls className="w-full max-h-72 object-contain bg-black rounded-lg" />
        </div>
      )}
    </div>
  );
}