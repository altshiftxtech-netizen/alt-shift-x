import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import suiteBentoNodes from '@/components/suite/suiteBentoNodes';
import '@/components/suite/hubNavigation.css';

export default function SuiteBentoSwitcher() {
  const [open, setOpen] = useState(false);
  const wrapper = useRef(null), trigger = useRef(null);
  useEffect(() => {
    if (!open) return;
    const outside = event => { if (!wrapper.current?.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    wrapper.current?.querySelector('nav a')?.focus();
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <div className="suite-bento" ref={wrapper}>
    <button ref={trigger} type="button" className="suite-bento-trigger" aria-label="Open suite apps" aria-expanded={open} aria-controls={open ? 'suite-bento-panel' : undefined} onClick={() => setOpen(!open)}>
      {Array.from({ length: 9 }, (_, index) => <span key={index} aria-hidden="true" />)}
    </button>
    {open && <nav id="suite-bento-panel" aria-label="Suite nodes" className="suite-bento-panel">
      <strong>Alt+Shift+X Suite · v2.0</strong>
      <div className="suite-bento-links">{suiteBentoNodes.map(({ id, name, label, path, url, Icon }) => {
        const content = <><span className="suite-bento-icon"><Icon aria-hidden="true" /></span><span><small>{label}</small><b>{name}</b></span></>;
        return id === 'altshiftx'
          ? <Link key={id} to={path} onClick={() => setOpen(false)}>{content}</Link>
          : <a key={id} href={url} referrerPolicy="no-referrer" onClick={() => setOpen(false)}>{content}</a>;
      })}</div>
    </nav>}
  </div>;
}