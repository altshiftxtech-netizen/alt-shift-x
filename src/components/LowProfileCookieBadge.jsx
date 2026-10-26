// src/components/LowProfileCookieBadge.jsx
import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'asx_cookie_consent_v1';
const EXPIRY_DAYS = 180;

export default function LowProfileCookieBadge() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Granular preference state
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    // 1. Check existing consent in localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const ageInDays = (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24);
        if (ageInDays < EXPIRY_DAYS) {
          return; // Consent still valid, do not show
        }
      }
    } catch (e) {
      // Fallback if localStorage blocked
    }

    // 2. Soft delay: show 1.5s after initial page load
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    // 3. Auto-minimize after 15s if user ignores it (unobtrusive ambient state)
    const autoMinimizeTimer = setTimeout(() => {
      setIsMinimized(true);
    }, 16500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(autoMinimizeTimer);
    };
  }, []);

  const saveConsent = (allowAnalytics) => {
    try {
      const payload = {
        consent: allowAnalytics ? 'all' : 'essential',
        analytics: allowAnalytics,
        timestamp: Date.now(),
        version: '1.0',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {}

    setIsVisible(false);
    setShowPreferences(false);
  };

  if (!isVisible) return null;

  // -------------------------------------------------------------
  // STATE A: AMBIENT MINIMIZED CORNER SHIELD (Tucked away)
  // -------------------------------------------------------------
  if (isMinimized && !showPreferences) {
    return (
      <div className="fixed top-3 right-3 z-50 animate-fadeIn">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 hover:border-yellow-500/40 text-[10px] font-mono text-zinc-400 hover:text-white transition-all shadow-lg"
          title="Cookie & Privacy Preferences"
        >
          <span className="text-yellow-400">🛡️</span>
          <span className="hidden sm:inline">Privacy</span>
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE B: ULTRA-LOW PROFILE TRANSLUCENT GLASS PILL (~38px)
  // -------------------------------------------------------------
  return (
    <>
      <div className="fixed bottom-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-slideUp">
        <div className="pointer-events-auto max-w-2xl w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 px-3.5 py-2 rounded-2xl bg-zinc-950/70 hover:bg-zinc-950/90 backdrop-blur-xl border border-white/10 hover:border-white/20 text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all">
          
          {/* Subtle Notice Text */}
          <div className="flex items-center space-x-2 text-[11px] text-zinc-300 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0 animate-pulse" />
            <span className="leading-tight">
              We use strictly essential local cookies for security and performance.
              <button
                onClick={() => setShowPreferences(true)}
                className="ml-1.5 text-zinc-400 hover:text-yellow-400 underline underline-offset-2 transition-colors font-mono text-[10px]"
              >
                Preferences
              </button>
            </span>
          </div>

          {/* Action Buttons (Equal Prominence for GDPR Compliance) */}
          <div className="flex items-center space-x-1.5 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={() => saveConsent(false)}
              className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              Essential Only
            </button>
            <button
              onClick={() => saveConsent(true)}
              className="px-3 py-1 rounded-xl text-[10px] font-mono font-bold text-black bg-gradient-to-r from-yellow-400 to-amber-300 hover:brightness-110 shadow-sm transition-all"
            >
              Accept All
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="px-1.5 py-1 text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
              title="Minimize notice"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* OPTIONAL MODAL: GRANULAR PREFERENCE DRAWER                    */}
      {/* ------------------------------------------------------------- */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-zinc-950 border border-yellow-500/40 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">🛡️</span>
                <h3 className="text-sm font-bold text-white font-mono">Cookie & Data Consent</h3>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-5 text-xs">
              <div className="flex items-start justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <div className="font-bold text-white mb-0.5">Strictly Essential Cookies</div>
                  <div className="text-[11px] text-zinc-400">Session auth, CSRF security tokens, and WebGPU local rendering. Required for operation.</div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md shrink-0 ml-2">
                  Always Active
                </span>
              </div>

              <div className="flex items-start justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <div className="font-bold text-white mb-0.5">Anonymous Telemetry & Speed</div>
                  <div className="text-[11px] text-zinc-400">Aggregated client frame-rates and edge network latency monitors ($0.00 token tracking).</div>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="w-4 h-4 mt-1 accent-yellow-400 cursor-pointer shrink-0 ml-2"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => saveConsent(analyticsEnabled)}
                className="w-full py-2 rounded-xl text-xs font-bold bg-yellow-400 hover:bg-yellow-300 text-black transition-all"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}