import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

const AUDIO_URL = 'https://media.base44.com/files/public/6a19363c90f06323c4cfff73/60fceeda2_train-great-fitness-sports-theme-2.mp3';

export default function SuiteMusicPlayer() {
  const audioRef = useRef(null);
  const ctxRef = useRef(null);
  const sourceRef = useRef(null);
  const filtersRef = useRef(null);
  const gainRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  // Build the EQ chain once (bass, mid, treble + gain for warmth on any system)
  const buildChain = (audio) => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const source = ctx.createMediaElementSource(audio);
    // Bass
    const bass = ctx.createBiquadFilter();
    bass.type = 'lowshelf';
    bass.frequency.value = 200;
    bass.gain.value = 3;
    // Mid presence
    const mid = ctx.createBiquadFilter();
    mid.type = 'peaking';
    mid.frequency.value = 1200;
    mid.Q.value = 0.8;
    mid.gain.value = 1.5;
    // Treble clarity
    const treble = ctx.createBiquadFilter();
    treble.type = 'highshelf';
    treble.frequency.value = 6000;
    treble.gain.value = 2.5;
    // Overall gain (ceiling)
    const gain = ctx.createGain();
    gain.gain.value = 0.85;
    source.connect(bass);
    bass.connect(mid);
    mid.connect(treble);
    treble.connect(gain);
    gain.connect(ctx.destination);
    ctxRef.current = ctx;
    sourceRef.current = source;
    filtersRef.current = { bass, mid, treble };
    gainRef.current = gain;
  };

  const start = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!ctxRef.current) buildChain(audio);
    if (ctxRef.current?.state === 'suspended') await ctxRef.current.resume();
    audio.volume = 1;
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const pause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setPlaying(false);
  };

  const toggle = () => (playing ? pause() : start());

  useEffect(() => {
    const audio = new Audio(AUDIO_URL);
    audio.loop = true;
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;
    setReady(true);

    // Attempt autoplay (browsers may block until first interaction)
    const tryAutoplay = async () => {
      if (!ctxRef.current) buildChain(audio);
      if (ctxRef.current?.state === 'suspended') await ctxRef.current.resume();
      audio.volume = 1;
      try { await audio.play(); setPlaying(true); } catch { setPlaying(false); }
    };
    let autoplayTimer;
    const scheduleAutoplay = () => {
      autoplayTimer = window.setTimeout(tryAutoplay, 3000);
    };
    if (document.readyState === 'complete') scheduleAutoplay();
    else window.addEventListener('load', scheduleAutoplay, { once: true });

    return () => {
      window.removeEventListener('load', scheduleAutoplay);
      window.clearTimeout(autoplayTimer);
      audio.pause();
      ctxRef.current?.close?.();
    };
  }, []);

  return (
    <button
      onClick={toggle}
      disabled={!ready}
      aria-label={playing ? 'Pause suite music' : 'Play suite music'}
      className="group flex items-center gap-2 rounded-full border border-yellow-500/30 bg-white/5 px-3 py-1.5 text-yellow-400 backdrop-blur-md transition-all hover:border-yellow-500/60 hover:bg-yellow-500/10 disabled:opacity-40"
      style={{ boxShadow: '0 4px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)' }}
    >
      {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      <span className="hidden text-[11px] font-mono tracking-wider sm:inline">
        {playing ? 'AMBIENT FEED' : 'TAP TO PLAY'}
      </span>
      {playing && (
        <span className="flex items-end gap-[2px]" aria-hidden>
          <span className="inline-block h-2 w-[2px] animate-pulse bg-yellow-400" style={{ animationDuration: '0.6s' }} />
          <span className="inline-block h-3 w-[2px] animate-pulse bg-yellow-400" style={{ animationDuration: '0.9s' }} />
          <span className="inline-block h-1.5 w-[2px] animate-pulse bg-yellow-400" style={{ animationDuration: '0.45s' }} />
        </span>
      )}
    </button>
  );
}