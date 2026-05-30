/**
 * VoiceChat — floating voice command widget.
 * Uses Web Speech API (SpeechRecognition) — best accuracy, zero latency.
 * Works on Chrome, Edge, Android WebView, Meta Ray-Ban, Google Glass Enterprise, Vuzix Blade.
 *
 * Voice Navigation Commands (handled internally):
 *   "go to dashboard" / "open marketplace" / "usage analytics" / "settings" / etc.
 *   "generate report" / "export finance report" / "export usage report"
 *   "show telemetry" / "open webhooks"
 *
 * Props:
 *   onTranscript(text)   — called with final recognized text for AI chat
 *   onNavigate(path)     — called when a navigation command is detected
 *   onCommand(cmd)       — called with special commands: "generate_finance", "generate_usage"
 *   compact              — minimal mic-only button (AR HUD mode)
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, X, Wifi, WifiOff, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const supported = !!SpeechRecognition;

// Voice navigation command map
const NAV_COMMANDS = [
  { patterns: ["go to dashboard", "open dashboard", "dashboard"], path: "/dashboard" },
  { patterns: ["go to marketplace", "open marketplace", "marketplace", "browse components"], path: "/marketplace" },
  { patterns: ["usage analytics", "go to analytics", "show analytics", "open analytics"], path: "/dashboard/usage" },
  { patterns: ["api keys", "open api keys", "show api keys"], path: "/dashboard/api-keys" },
  { patterns: ["webhooks", "open webhooks", "show webhooks"], path: "/dashboard/webhooks" },
  { patterns: ["settings", "account settings", "open settings"], path: "/dashboard/settings" },
  { patterns: ["subscription", "billing", "open subscription"], path: "/dashboard/subscription" },
  { patterns: ["builder", "open builder", "go to builder"], path: "/builder" },
  { patterns: ["installed components", "my components", "installed"], path: "/dashboard/installed" },
  { patterns: ["pricing", "show pricing", "open pricing"], path: "/pricing" },
  { patterns: ["admin panel", "open admin", "admin"], path: "/admin" },
  { patterns: ["governance", "open governance"], path: "/builder/governance" },
];

const SPECIAL_COMMANDS = [
  { patterns: ["generate finance report", "export finance report", "finance report", "generate financial report"], cmd: "generate_finance" },
  { patterns: ["generate usage report", "export usage report", "usage report", "generate api report"], cmd: "generate_usage" },
  { patterns: ["show telemetry", "open telemetry", "component telemetry", "telemetry"], cmd: "show_telemetry" },
  { patterns: ["generate report", "export report", "monthly report"], cmd: "generate_finance" },
];

function matchCommand(text, commandList) {
  const lower = text.toLowerCase().trim();
  for (const entry of commandList) {
    for (const pattern of entry.patterns) {
      if (lower.includes(pattern)) return entry;
    }
  }
  return null;
}

export default function VoiceChat({ onTranscript, onCommand, compact = false }) {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [lastFinal, setLastFinal] = useState("");
  const [lastAction, setLastAction] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recognizerRef = useRef(null);
  const restartTimerRef = useRef(null);
  const listeningRef = useRef(false);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.1;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, []);

  const handleFinalText = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // 1. Check navigation commands
    const navMatch = matchCommand(trimmed, NAV_COMMANDS);
    if (navMatch) {
      setLastAction(`Navigating to ${navMatch.path}`);
      speak(`Going to ${navMatch.path.replace(/\//g, " ").trim() || "dashboard"}`);
      setTimeout(() => navigate(navMatch.path), 600);
      return;
    }

    // 2. Check special commands
    const specialMatch = matchCommand(trimmed, SPECIAL_COMMANDS);
    if (specialMatch) {
      setLastAction(`Command: ${specialMatch.cmd}`);
      speak(specialMatch.cmd === "generate_finance" ? "Generating finance report" :
            specialMatch.cmd === "generate_usage" ? "Generating usage report" :
            specialMatch.cmd === "show_telemetry" ? "Opening telemetry" : "Running command");
      onCommand && onCommand(specialMatch.cmd);
      return;
    }

    // 3. Pass to AI consultant
    setLastFinal(trimmed);
    setLastAction("");
    onTranscript && onTranscript(trimmed);
  }, [navigate, onCommand, onTranscript, speak]);

  const buildRecognizer = useCallback(() => {
    if (!supported) return null;
    const r = new SpeechRecognition();
    r.lang = "en-US";
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onresult = (e) => {
      let interimText = "";
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interimText += t;
      }
      setInterim(interimText);
      if (finalText.trim()) {
        setInterim("");
        handleFinalText(finalText);
      }
    };

    r.onerror = (e) => {
      if (e.error === "not-allowed") {
        setError("Microphone access denied. Please allow mic permissions.");
        setListening(false);
        listeningRef.current = false;
      } else if (e.error === "no-speech") {
        setError("");
      } else if (e.error === "network") {
        setError("Network issue — trying again.");
      } else {
        setError(e.error);
      }
    };

    r.onend = () => {
      if (listeningRef.current) {
        restartTimerRef.current = setTimeout(() => {
          try { r.start(); } catch (_) {}
        }, 250);
      } else {
        setListening(false);
      }
    };

    return r;
  }, [handleFinalText]);

  const startListening = useCallback(() => {
    if (!supported) { setError("Voice not supported in this browser."); return; }
    setError("");
    setInterim("");
    const r = buildRecognizer();
    recognizerRef.current = r;
    listeningRef.current = true;
    try {
      r.start();
      setListening(true);
    } catch (e) {
      setError("Could not start microphone.");
    }
  }, [buildRecognizer]);

  const stopListening = useCallback(() => {
    clearTimeout(restartTimerRef.current);
    listeningRef.current = false;
    setListening(false);
    setInterim("");
    try { recognizerRef.current?.stop(); } catch (_) {}
  }, []);

  const toggleListening = () => {
    if (listening) stopListening();
    else startListening();
  };

  useEffect(() => {
    return () => {
      clearTimeout(restartTimerRef.current);
      listeningRef.current = false;
      try { recognizerRef.current?.stop(); } catch (_) {}
    };
  }, []);

  if (compact) {
    return (
      <button onClick={toggleListening} title={listening ? "Stop voice" : "Start voice"}
        className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all shadow",
          listening ? "bg-red-500 text-white animate-pulse" : "bg-violet-700 text-white hover:bg-violet-800")}>
        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <>
      {/* Floating trigger */}
      <button onClick={() => setOpen(o => !o)} title="Voice Command"
        className={cn("fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all text-white",
          listening ? "bg-red-500 animate-pulse" : "bg-violet-700 hover:bg-violet-800")}>
        {listening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>

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

          <div className="px-4 py-5 text-center space-y-3">
            {/* Mic button */}
            <button onClick={toggleListening} disabled={!supported}
              className={cn("w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all shadow-lg",
                !supported ? "bg-slate-200 text-slate-400 cursor-not-allowed" :
                listening ? "bg-red-500 text-white scale-110 shadow-red-200" :
                "bg-violet-700 text-white hover:scale-105")}>
              {listening ? (
                <div className="relative">
                  <Mic className="w-8 h-8" />
                  <span className="absolute inset-0 rounded-full border-2 border-white/60 animate-ping" />
                </div>
              ) : <Mic className="w-8 h-8" />}
            </button>

            <p className={cn("text-xs font-semibold", listening ? "text-red-500" : "text-slate-500")}>
              {!supported ? "Not supported in this browser" :
               listening ? "Listening… speak now" : "Tap to start voice input"}
            </p>

            {/* Interim */}
            {interim && (
              <div className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-2 text-left">
                <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-wide mb-0.5">Hearing…</p>
                <p className="text-sm text-violet-800 italic">{interim}</p>
              </div>
            )}

            {/* Navigation action */}
            {lastAction && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-left">
                <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wide mb-0.5 flex items-center gap-1"><Navigation className="w-2.5 h-2.5" /> Action</p>
                <p className="text-sm text-blue-800">{lastAction}</p>
              </div>
            )}

            {/* Last recognized phrase */}
            {lastFinal && !interim && !lastAction && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-left">
                <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wide mb-0.5">Recognized ✓</p>
                <p className="text-sm text-slate-800">"{lastFinal}"</p>
                <button onClick={() => speak(lastFinal)}
                  className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-600 hover:underline">
                  <Volume2 className="w-3 h-3" /> {speaking ? "Speaking…" : "Read aloud"}
                </button>
              </div>
            )}

            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
          </div>

          {/* Navigation commands cheat sheet */}
          <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Voice Commands</p>
            <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500">
              <span>"Go to dashboard"</span><span>"Open marketplace"</span>
              <span>"Usage analytics"</span><span>"Show settings"</span>
              <span>"Generate report"</span><span>"Show telemetry"</span>
              <span>"Open webhooks"</span><span>"Go to builder"</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Compatible with Google Glass, Meta Ray-Ban, Vuzix Blade.</p>
          </div>
        </div>
      )}
    </>
  );
}