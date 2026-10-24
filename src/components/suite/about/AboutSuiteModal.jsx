import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AboutAltShiftXSuite from '@/pages/AboutAltShiftXSuite';
import AboutSuiteLogo from '@/components/suite/about/AboutSuiteLogo';
export default function AboutSuiteModal({ onClose, onPasses }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element.close(); document.body.style.overflow = overflow; };
  }, []);
  return <dialog ref={dialog} aria-label="About The Alt+Shift+X Suite" className="about-suite about-suite-modal bg-background text-foreground p-0" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="about-suite-modal-top"><Link to="/aboutaltshiftxsuite">Open full page →</Link><div className="flex items-center gap-3"><AboutSuiteLogo onNavigate={onClose} /><button type="button" autoFocus aria-label="Close suite showcase" onClick={onClose}>×</button></div></div>
    <AboutAltShiftXSuite embedded onPasses={onPasses} onReturn={onClose} />
  </dialog>;
}