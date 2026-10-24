import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SovereignPassPage from '@/pages/SovereignPassPage';
import AboutSuiteLogo from '@/components/suite/about/AboutSuiteLogo';
export default function SovereignPassModal({ onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current, overflow = document.body.style.overflow;
    element.showModal(); document.body.style.overflow = 'hidden';
    return () => { element.close(); document.body.style.overflow = overflow; };
  }, []);
  return <dialog ref={dialog} aria-label="Sovereign Pass Foundry" className="about-suite about-suite-modal sovereign-pass-modal bg-background text-foreground p-0" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="about-suite-modal-top"><Link to="/sovereignpass" onClick={onClose}>Open full Pass Foundry →</Link><div className="flex items-center gap-3"><AboutSuiteLogo onNavigate={onClose} /><button type="button" autoFocus aria-label="Close Pass Foundry" onClick={onClose}>×</button></div></div>
    <SovereignPassPage embedded />
  </dialog>;
}