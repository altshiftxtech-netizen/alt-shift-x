import { useRef, useCallback, useEffect } from "react";
import { FOLEY } from "./cinemaBlueprint";

/**
 * useFoley — subtle synthesized foley for the Director's Cut panels, built on
 * the Web Audio API (no assets to load). Each cue is a short, quiet texture:
 *   server_hum   — a low 60Hz-ish drone with a soft swell.
 *   key_click    — a tight mechanical-keyboard tick.
 *   data_whisper — filtered noise, like data hissing past.
 *
 * Returns { play(cue), enabled, toggle }. Audio is opt-in (starts muted until
 * the user toggles it on — browsers require a gesture to start audio anyway).
 */
export default function useFoley() {
  const ctxRef = useRef(null);
  const enabledRef = useRef(false);

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const serverHum = (ctx) => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(58, t);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 180;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 0.3);
    gain.gain.linearRampToValueAtTime(0, t + 1.6);
    osc.connect(lp); lp.connect(gain); gain.connect(ctx.destination);
    osc.start(t); osc.stop(t + 1.7);
  };

  const keyClick = (ctx) => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.04);
    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.07);
  };

  const dataWhisper = (ctx) => {
    const t = ctx.currentTime;
    const dur = 1.1;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 3200;
    bp.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.2);
    gain.gain.linearRampToValueAtTime(0, t + dur);
    src.connect(bp); bp.connect(gain); gain.connect(ctx.destination);
    src.start(t); src.stop(t + dur);
  };

  const play = useCallback((cue) => {
    if (!enabledRef.current) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    if (cue === FOLEY.SERVER_HUM) serverHum(ctx);
    else if (cue === FOLEY.KEY_CLICK) keyClick(ctx);
    else if (cue === FOLEY.DATA_WHISPER) dataWhisper(ctx);
  }, [ensureCtx]);

  const toggle = useCallback(() => {
    enabledRef.current = !enabledRef.current;
    if (enabledRef.current) ensureCtx();
    return enabledRef.current;
  }, [ensureCtx]);

  useEffect(() => () => { if (ctxRef.current) ctxRef.current.close(); }, []);

  return { play, toggle, isEnabled: () => enabledRef.current };
}