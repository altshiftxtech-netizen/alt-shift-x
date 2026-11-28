import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Loader2 } from 'lucide-react';
import { paintDirectorFrame, stageSize } from '@/components/upkeeper/commercial/directorPaint';
import { totalSeconds, beatAt } from '@/components/upkeeper/commercial/directorPlan';
import { buildDirectorAudio, decodeVoices } from '@/components/upkeeper/commercial/directorAudio';
import resumeAudioContext from '@/components/upkeeper/audio/resumeAudioContext';

import AltShiftXWatermark from '@/components/upkeeper/commercial/AltShiftXWatermark';
import { releaseCinemaGrade } from '@/components/upkeeper/commercial/cinemaGrade';
import remixPlayback from '@/components/upkeeper/commercial/remixPlayback';

const clock = (s) => {
  const safe = Math.max(0, s);
  return `${Math.floor(safe / 60)}:${String(Math.floor(safe % 60)).padStart(2, '0')}.${String(
    Math.floor((safe % 1) * 10)
  )}`;
};

/**
 * Live preview: paints the same frames the recorder will encode and plays the
 * same score and mix, so the operator judges the sound before a render.
 */
export default function DirectorStage({ plan, assets, watermark, levels, score, voiceUrls, onSelectWord, onBeat }) {
  const canvasRef = useRef(null);
  const hitsRef = useRef([]);
  const rafRef = useRef(0);
  const audioRef = useRef(null);
  const clockRef = useRef(0);
  const lastTenth = useRef(-1);
  const beatRef = useRef(-1);
  const timeRef = useRef(0);
  const playRequest = useRef(0);
  const levelsRef = useRef(levels);
  const footageRef = useRef(null);
  const [footageError, setFootageError] = useState('');
  useEffect(() => {
    const footage = remixPlayback(plan.remix);
    footageRef.current = footage;
    setFootageError('');
    return () => { footage?.dispose(); footageRef.current = null; };
  }, [plan.remix]);

  const [playing, setPlaying] = useState(false);
  const [arming, setArming] = useState(false);
  const [time, setTime] = useState(0);

  const duration = totalSeconds(plan);

  const paint = useCallback(
    (at, running = false) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const footage = footageRef.current;
      const draw = referenceFrame => {
        hitsRef.current = paintDirectorFrame(canvas, at, plan, { ...assets, referenceFrame }) || [];
      };
      if (!footage) draw();
      else if (running) { const frame = footage.frame(at); if (frame) draw(frame); }
      else void footage.seek(at).then(frame => { if (frame && footageRef.current === footage && timeRef.current === at) draw(frame); }).catch(e => { if (footageRef.current === footage) setFootageError(e.message); });
      const index = beatAt(plan, at).index;
      if (index !== beatRef.current) {
        beatRef.current = index;
        onBeat?.(index);
      }
    },
    [plan, assets, onBeat]
  );

  const paintRef = useRef(paint);
  useEffect(() => { paintRef.current = paint; }, [paint]);
  useEffect(() => {
    levelsRef.current = levels;
    audioRef.current?.mix.setLevels(levels);
  }, [levels]);
  useEffect(() => {
    const canvas = canvasRef.current;
    return () => { if (canvas) releaseCinemaGrade(canvas); };
  }, []);

  // Size the canvas for the current aspect and repaint on every plan edit.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = stageSize(plan.aspect, 720);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    paint(timeRef.current);
  }, [plan, assets, duration, paint]);

  const stop = useCallback(() => {
    playRequest.current += 1;
    setArming(false);
    cancelAnimationFrame(rafRef.current);
    footageRef.current?.pause();
    const audio = audioRef.current;
    audioRef.current = null;
    if (audio) {
      audio.mix.stop();
      if (audio.context.state !== 'closed') void audio.context.close();
    }
    setPlaying(false);
  }, []);

  useEffect(() => () => stop(), [stop, score, voiceUrls, plan.remix]);

  const tick = useCallback(() => {
    const audio = audioRef.current;
    const now = audio
      ? audio.context.currentTime - clockRef.current
      : performance.now() / 1000 - clockRef.current;
    const at = Math.max(0, Math.min(duration, now));
    timeRef.current = at;
    try { paintRef.current(at, true); }
    catch (e) { stop(); setFootageError(e.message); return; }
    const tenth = Math.floor(at * 10);
    if (tenth !== lastTenth.current) {
      lastTenth.current = tenth;
      setTime(at);
    }
    if (at >= duration) {
      stop();
      timeRef.current = 0;
      setTime(0);
      if (footageRef.current) paintRef.current(0);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [duration, stop]);

  const play = async () => {
    if (playing) {
      stop();
      return;
    }
    const from = timeRef.current >= duration - 0.05 ? 0 : timeRef.current;
    timeRef.current = from;
    setArming(true);
    const request = ++playRequest.current;
    let context, mix;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext({ sampleRate: 48000 });
      await resumeAudioContext(context);
      const footage = footageRef.current;
      const warm = footage?.warm(from).catch(e => { if (footageRef.current === footage) setFootageError(e.message); });
      const [buffers] = await Promise.all([decodeVoices(context, voiceUrls), warm]);
      if (request !== playRequest.current) { await context.close(); return; }
      mix = buildDirectorAudio(context, context.destination, { plan, voiceBuffers: buffers, levels: levelsRef.current, score });
      const at = context.currentTime + 0.08;
      mix.start(at, from);
      audioRef.current = { context, mix };
      clockRef.current = at - from;
    } catch {
      mix?.stop();
      if (context && context.state !== 'closed') void context.close();
      if (request !== playRequest.current) return;
      clockRef.current = performance.now() / 1000 - from;
    }
    setArming(false);
    setPlaying(true);
    lastTenth.current = -1;
    rafRef.current = requestAnimationFrame(tick);
  };

  const scrub = (value) => {
    const at = Number(value);
    stop();
    timeRef.current = at;
    setTime(at);
    paint(at);
  };

  const click = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    const hit = hitsRef.current.find((h) => x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h);
    if (hit) onSelectWord?.(hit.i);
  };

  return (
    <div>
      <div className="dm-frame">
        <div className="relative w-full" style={{maxWidth:plan.aspect==='16:9'?'110.2222vh':'34.875vh',aspectRatio:plan.aspect.replace(':',' / ')}}>
          <canvas ref={canvasRef} onClick={click} aria-label="Commercial preview" />
          {watermark?.enabled && <AltShiftXWatermark {...watermark} aspect={plan.aspect} />}
        </div>
      </div>
      {footageError && <p className="dm-error" role="alert">{footageError}</p>}
      <div className="dm-transport">
        <button
          type="button"
          className="dm-play"
          onClick={play}
          disabled={arming}
          aria-label={playing ? 'Pause preview' : 'Play preview'}
        >
          {arming ? <Loader2 className="w-4 h-4 dm-spin" /> : playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          type="button"
          className="dm-play"
          onClick={() => scrub(0)}
          aria-label="Restart preview"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <input
          className="dm-scrub"
          type="range"
          min={0}
          max={Math.max(0.1, duration)}
          step={0.01}
          value={Math.min(time, duration)}
          onChange={(e) => scrub(e.target.value)}
          aria-label="Timeline scrubber"
        />
        <span className="dm-time">
          {clock(time)} / {clock(duration)}
        </span>
      </div>
    </div>
  );
}