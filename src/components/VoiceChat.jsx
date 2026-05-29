/**
 * VoiceChat — floating voice command widget.
 * Uses the Web Speech API (SpeechRecognition) — best accuracy, zero latency,
 * works natively on Chrome, Edge, Android WebView, and AR glass browsers
 * (Meta Ray-Ban, Google Glass Enterprise, Vuzix Blade, etc.)
 *
 * Props:
 *   onTranscript(text) — called with final recognized text
 *   compact — renders a minimal mic-only button (ideal for AR HUD mode)
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, X, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const supported = !!SpeechRecognition;

export default function VoiceChat({ onTranscript, compact = false }) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [lastFinal, setLastFinal] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recognizerRef = useRef(null);
  const restartTimerRef = useRef(null);

  // Build recognizer
  const buildRecognizer = useCallback(() => {
    if (!supported) return null;
    const r = new SpeechRecognition();
    r.lang = "en-US";
    r.continuous = true;          // keeps listening — no need to re-tap
    r.interimResults = true;      // show live preview
    r.maxAlternatives = 1;

    r.onresult = (e) => {
      let interimText = "";
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += t;
        } else {
          interimText += t;
        }
      }
      setInterim(interimText);
      if (finalText.trim()) {
        setLastFinal(finalText.trim());
        setInterim("");
        onTranscript && onTranscript(finalText.trim());
      }
    };

    r.onerror = (e) => {
      if (e.error === "not-allowed") {
        setError("Microphone access denied. Please allow mic permissions.");
        setListening(false);
      } else if (e.error === "no-speech") {
        setError("");
        // no-speech is expected during silences — just restart
      } else if (e.error === "network") {
        setError("Network issue. Using offline mode if available.");
      } else {
        setError(e.error);
      }
    };

    r.onend = () => {
      // Auto-restart when continuous mode stops (e.g. silence timeout)
      if (listening) {
        restartTimerRef.current = setTimeout(() => {
          try { r.start(); } catch (_) {}
        }, 200);
      } else {
        setListening(false);
      }
    };

    return r;
  }, [listening, onTranscript]);

  const startListening = () => {
    if (!supported) { setError("Voice not supported in this browser."); return; }
    setError("");
    setInterim("");
    const r = buildRecognizer();
    recognizerRef.current = r;
    try {
      r.start();
      setListening(true);
    } catch (e) {
      setError("Could not start microphone.");
    }
  };

  const stopListening = () => {
    clearTimeout(restartTimerRef.current);
    setListening(false);
    setInterim("");
    try { recognizerRef.current?.stop(); } catch (_) {}
  };

  const toggleListening = () => {
    if (listening) stopListening();
    else startListening();
  };

  // Speak a response aloud (optional TTS feedback)
  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.1;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(restartTimerRef.current);
      try { recognizerRef.current?.stop(); } catch (_) {}
    };
  }, []);

  // ── Compact AR/glass mode ────────────────────────────────────────────────
  if (compact) {
    return (
      <button
        onClick={toggleListening}
        title={listening ? "Stop voice input" : "Start voice input"}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow",
          listening
            ? "bg-red-500 text-white animate-pulse"
            : "bg-violet-700 text-white hover:bg-violet-800"
        )}
      >
        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
    );
  }

  // ── Full floating widget ────────────────────────────────────────────────
  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Voice Chat"
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all",
          listening ? "bg-red-500 animate-pulse" : "bg-violet-700 hover:bg-violet-800",
          "text-white"
        )}
      >
        {listening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-violet-700 text-white">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              <span className="text-sm font-bold">Voice Command</span>
              {supported
                ? <span className="flex items-center gap-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full"><Wifi className="w-2.5 h-2.5" /> Web Speech API</span>
                : <span className="flex items-center gap-1 text-[10px] bg-red-400/50 px-1.5 py-0.5 rounded-full"><WifiOff className="w-2.5 h-2.5" /> Not supported</span>
              }
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-lg p-1"><X className="w-4 h-4" /></button>
          </div>

          {/* Visualizer / status */}
          <div className="px-4 py-5 text-center space-y-3">
            {/* Mic button */}
            <button
              onClick={toggleListening}
              disabled={!supported}
              className={cn(
                "w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all shadow-lg",
                !supported ? "bg-slate-200 text-slate-400 cursor-not-allowed" :
                listening ? "bg-red-500 text-white scale-110 shadow-red-200" :
                "bg-violet-700 text-white hover:scale-105"
              )}
            >
              {listening ? (
                <div className="relative">
                  <Mic className="w-8 h-8" />
                  {/* Pulse rings */}
                  <span className="absolute inset-0 rounded-full border-2 border-white/60 animate-ping" />
                </div>
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>

            <p className={cn("text-xs font-semibold", listening ? "text-red-500" : "text-slate-500")}>
              {!supported ? "Not supported in this browser" :
               listening ? "Listening… speak now" :
               "Tap to start voice input"}
            </p>

            {/* Live interim transcript */}
            {interim && (
              <div className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-2 text-left">
                <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-wide mb-0.5">Hearing…</p>
                <p className="text-sm text-violet-800 italic">{interim}</p>
              </div>
            )}

            {/* Last confirmed phrase */}
            {lastFinal && !interim && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-left">
                <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wide mb-0.5">Recognized ✓</p>
                <p className="text-sm text-slate-800">"{lastFinal}"</p>
                <button
                  onClick={() => speak(lastFinal)}
                  className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-600 hover:underline"
                >
                  <Volume2 className="w-3 h-3" /> {speaking ? "Speaking…" : "Read aloud"}
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
            )}
          </div>

          {/* Footer tips */}
          <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Works with Google Glass, Meta Ray-Ban, Vuzix Blade and other AR/XR browsers.<br />
              Say commands like <span className="font-semibold text-slate-600">"Show me risk components"</span> or <span className="font-semibold text-slate-600">"Find budget tools."</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}