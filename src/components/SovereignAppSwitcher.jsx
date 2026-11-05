import React, { useState, useEffect, useRef } from 'react';
import { base44 } from "@/api/base44Client";
import useSuiteHandoff from '@/hooks/useSuiteHandoff';
import suiteBrandNames from '@/components/suite/suiteBrandNames';

const ENTERPRISE_SUITE = [
  {
    id: 'altshiftx',
    name: suiteBrandNames.altshiftx,
    category: 'Master Intelligence & Component Foundry',
    url: 'https://altshiftx.tech',
    path: '/',
    icon: '💠',
    color: '#F59E0B',
    isMaster: true,
  },
  {
    id: 'turimc',
    name: suiteBrandNames.turimc,
    category: 'Extreme Compute & Hardware Proving Ground',
    url: 'https://turimc.altshiftx.tech',
    path: '/turimc',
    icon: '⚙️',
    color: '#10B981',
  },
  {
    id: 'codevault',
    name: suiteBrandNames.codevault,
    category: 'Sovereign Git & WASM Repositories',
    url: 'https://codevault.altshiftx.tech',
    path: '/codevault',
    icon: '📦',
    color: '#06B6D4',
  },
  {
    id: 'dblive',
    name: suiteBrandNames.dblive,
    category: 'Sovereign Immutable WORM Database',
    url: 'https://dblive.altshiftx.tech',
    path: '/dblive',
    icon: '🛡️',
    color: '#F59E0B',
  },
  {
    id: 'omnibridge',
    name: suiteBrandNames.omnibridge,
    category: 'Executive Pipeline & CRM',
    url: 'https://omnibridge.altshiftx.tech',
    path: '/omnibridge',
    icon: '💼',
    color: '#F43F5E',
  },
  {
    id: 'bitfolio',
    name: suiteBrandNames.bitfolio,
    category: '3D Portfolio & Digital Cards',
    url: 'https://bitfolio.altshiftx.tech',
    path: '/bitfolio',
    icon: '💳',
    color: '#6366F1',
  },
  {
    id: 'sourcebridge',
    name: suiteBrandNames.sourcebridge,
    category: 'Universal API Substrate & Network',
    url: 'https://sourcebridge.altshiftx.tech',
    path: '/sourcebridge',
    icon: '🌐',
    color: '#14B8A6',
  },
  {
    id: 'magna',
    name: suiteBrandNames.magna,
    category: 'Visual Canvas & Site Foundry',
    url: 'https://magna.altshiftx.tech',
    path: '/magna',
    icon: '🎨',
    color: '#EC4899',
  },
];

export default function SovereignAppSwitcher({ activeAppId = 'altshiftx' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const menuRef = useRef(null);
  const handoff = useSuiteHandoff();

  // Auth + pricing gate: only show to authenticated users with an active
  // paid subscription (or admins). Guests and free-tier users don't see it.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (!me || cancelled) return;
        if (me.role === "admin") { if (!cancelled) setAuthorized(true); return; }
        const subs = await base44.entities.Subscription.filter({ user_id: me.id });
        const sub = subs[0];
        const active = sub && ["active", "trialing", "past_due"].includes(sub.status);
        if (!cancelled) setAuthorized(!!(active && sub.plan !== "free"));
      } catch {
        /* guest — not authorized */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!authorized) return null;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* 9-Dot Bento Matrix Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Sovereign Enterprise Suite (Cmd + K)"
        className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all shadow-lg backdrop-blur-md group"
      >
        <div className="grid grid-cols-3 gap-[2px] w-4 h-4">
          {[...Array(9)].map((_, i) => (
            <span
              key={i}
              className="w-1 h-1 rounded-sm bg-white/50 group-hover:bg-amber-400 transition-colors"
            />
          ))}
        </div>
      </button>

      {/* Glassmorphic Dropdown */}
      {isOpen && (
        <div className="fixed inset-x-4 top-20 w-auto sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-3 sm:w-96 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl backdrop-blur-2xl p-4 z-50">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Sovereign Enterprise Suite
              </h3>
            </div>
            <span className="text-[10px] text-amber-400 font-mono font-medium">8 Enterprise Nodes</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5 max-h-[420px] overflow-y-auto pr-1">
            {ENTERPRISE_SUITE.map((app) => {
              const isCurrent =
                app.id === activeAppId ||
                (typeof window !== 'undefined' &&
                  window.location.pathname === app.path);

              return (
                <a
                  key={app.id}
                  href={isCurrent ? '#' : app.path}
                  aria-disabled={Boolean(handoff.pending)}
                  aria-busy={handoff.pending === app.id}
                  referrerPolicy="no-referrer"
                  onClick={(event) => handoff.navigate(event, app, isCurrent, () => setIsOpen(false))}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-left group ${
                    app.isMaster
                      ? isCurrent
                        ? 'bg-amber-950/40 border-amber-500/60 shadow-inner'
                        : 'bg-amber-950/20 border-amber-800/50 hover:bg-amber-900/30 hover:border-amber-600'
                      : isCurrent
                      ? 'bg-slate-900/90 border-slate-600 shadow-inner'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{app.icon}</span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                          {app.name}
                        </span>
                        {app.isMaster && (
                          <span className="text-[8px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            HUB
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {app.category}
                      </span>
                    </div>
                  </div>
                  {isCurrent ? (
                    <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors pr-1">
                      ↗
                    </span>
                  )}
                </a>
              );
            })}
          </div>

          {handoff.pending && <p role="status" className="mt-3 text-xs text-muted-foreground">Preparing secure handoff…</p>}
          {handoff.error && <p role="alert" className="mt-3 text-xs text-destructive">{handoff.error}</p>}
          <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">ESC</kbd> to close</span>
            <span className="text-amber-400 font-medium">Root 0 Master Foundry</span>
          </div>
        </div>
      )}
    </div>
  );
}