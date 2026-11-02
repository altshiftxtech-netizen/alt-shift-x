import React, { useState } from 'react';
import SuiteLegalPopup from '@/components/suite/SuiteLegalPopup';
import CookiePreferenceCenter from '@/components/cookies/CookiePreferenceCenter';

export default function SuiteFooterLegalTabs() {
  const [active, setActive] = useState(null);
  return <>
    <nav aria-label="Legal and cookie settings" className="relative flex shrink-0 items-center gap-1 pointer-events-auto">
      {[['terms', 'Terms'], ['privacy', 'Privacy'], ['cookies', 'Cookie Settings']].map(([id, label]) => (
        <button key={id} type="button" aria-haspopup="dialog" aria-expanded={active === id}
          onClick={() => setActive(id)}
          className="relative inline-flex items-center justify-center whitespace-nowrap px-1 py-0.5 text-hub-navigation underline underline-offset-4 cursor-pointer pointer-events-auto hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current">
          {label}
        </button>
      ))}
    </nav>
    {(active === 'terms' || active === 'privacy') && <SuiteLegalPopup document={active} onClose={() => setActive(null)} />}
    {active === 'cookies' && <CookiePreferenceCenter open onOpenChange={open => { if (!open) setActive(null); }} />}
  </>;
}