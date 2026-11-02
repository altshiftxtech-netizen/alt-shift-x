import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getConsent, applyConsent, subscribeConsent, rejectAll, acceptAll } from '@/lib/cookieConsent';
import { onOpenCookiePreferences } from '@/components/cookies/cookiePrefStore';
import CookiePreferenceCenter from '@/components/cookies/CookiePreferenceCenter';

export default function LowProfileCookieBadge() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(() => !getConsent());
  const [preferences, setPreferences] = useState(false);
  useEffect(() => {
    const saved = getConsent();
    applyConsent(saved);
    setVisible(!saved);
    const stopChanges = subscribeConsent(record => setVisible(!record));
    const stopOpening = onOpenCookiePreferences(() => setPreferences(true));
    return () => { stopChanges(); stopOpening(); };
  }, []);
  return <>
    {visible && !preferences && createPortal(<div role="region" aria-label="Cookie notice" className={`fixed ${pathname === '/' ? 'bottom-16' : 'bottom-3'} inset-x-0 z-[9999] flex justify-center px-4 pointer-events-none`}>
      <div className="pointer-events-auto max-w-2xl w-full flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-card text-card-foreground border border-border shadow-xl">
        <p className="text-xs">Essential cookies keep this site working. Optional cookies stay off until accepted.</p>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={rejectAll} className="px-3 py-2 rounded-lg border border-border bg-secondary text-secondary-foreground text-xs font-semibold">Reject optional</button>
          <button type="button" onClick={acceptAll} className="px-3 py-2 rounded-lg border border-border bg-secondary text-secondary-foreground text-xs font-semibold">Accept All</button>
          <button type="button" onClick={() => setPreferences(true)} className="text-xs underline">Preferences</button>
        </div>
      </div>
    </div>, document.body)}
    {preferences && <CookiePreferenceCenter open onOpenChange={setPreferences} />}
  </>;
}