import React, { useState, useEffect } from "react";
import { Volume2, Wand2, RotateCcw, Play } from "lucide-react";
import {
  getVoiceSettings,
  saveVoiceSettings,
  listVoices,
  applyVoiceDescription,
  applyVoicePreset,
  VOICE_PRESETS,
  speak,
} from "@/lib/bobSounds";

const DEFAULTS = { voiceName: "", pitch: 1.15, rate: 1.1 };

// Lets the user tell BOB what to sound like — either by typing a plain-English
// description ("deeper and slower", "robotic", "more feminine") or by fine-tuning
// the voice, pitch, and rate directly. Settings persist via localStorage.
export default function BobVoiceSettings() {
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState([]);
  const [settings, setSettings] = useState(getVoiceSettings());
  const [description, setDescription] = useState("");

  useEffect(() => {
    const load = () => setVoices(listVoices());
    load();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = load;
    }
  }, []);

  const update = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveVoiceSettings(next);
  };

  const handleDescribe = () => {
    if (!description.trim()) return;
    const next = applyVoiceDescription(description);
    setSettings(next);
    speak("How's this? This is how I sound now.");
  };

  const handlePreset = (id) => {
    const next = applyVoicePreset(id);
    setSettings(next);
    speak("How's this? This is how I sound now.");
  };

  const handleReset = () => {
    saveVoiceSettings(DEFAULTS);
    setSettings(DEFAULTS);
    setDescription("");
  };

  const preview = () => speak("Hi. Builder Operated Bot online. This is my voice.");

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700/40 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-violet-400" /> BOB Voice
        </span>
        <span className="text-[10px] text-slate-500">{open ? "Hide" : "Adjust"}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3">
          {/* One-click voice presets */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-1.5">
              Pick a voice
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {VOICE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePreset(p.id)}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-violet-900/50 border border-slate-600 hover:border-violet-500 text-slate-300 hover:text-white text-[11px] font-medium px-2 py-1.5 rounded-lg transition-colors text-left"
                >
                  <span className="text-sm leading-none">{p.emoji}</span>
                  <span className="truncate">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Describe-it-in-words */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">
              Tell BOB how to sound
            </label>
            <div className="flex gap-1.5">
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDescribe()}
                placeholder="e.g. deeper and slower, robotic, British…"
                className="flex-1 bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-600 outline-none focus:border-violet-500"
              />
              <button
                onClick={handleDescribe}
                title="Apply description"
                className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <Wand2 className="w-3 h-3" /> Apply
              </button>
            </div>
            <p className="text-[9px] text-slate-500 mt-1">
              Try: deeper, higher, slower, faster, robotic, male, female, British.
            </p>
          </div>

          {/* Voice picker */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Voice</label>
            <select
              value={settings.voiceName}
              onChange={(e) => update({ voiceName: e.target.value })}
              className="w-full bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-600 outline-none focus:border-violet-500"
            >
              <option value="">Auto (deep robotic)</option>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} {v.lang ? `(${v.lang})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Pitch */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[10px] text-slate-400 font-semibold">Pitch (deep ↔ high)</label>
              <span className="text-[9px] text-slate-500">{settings.pitch.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={settings.pitch}
              onChange={(e) => update({ pitch: parseFloat(e.target.value) })}
              className="w-full accent-violet-500"
            />
          </div>

          {/* Rate */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[10px] text-slate-400 font-semibold">Speed (slow ↔ fast)</label>
              <span className="text-[9px] text-slate-500">{settings.rate.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.05"
              value={settings.rate}
              onChange={(e) => update({ rate: parseFloat(e.target.value) })}
              className="w-full accent-violet-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <button
              onClick={preview}
              className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Play className="w-3 h-3" /> Preview
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-slate-400 hover:text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg hover:bg-slate-700 transition-colors ml-auto"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}