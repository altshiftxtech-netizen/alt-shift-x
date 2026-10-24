import React, { useEffect, useRef, useState } from 'react';
import ConsuelaMatchmaker from '@/components/suite/consuela/ConsuelaMatchmaker';
import ConsuelaLogo from '@/components/suite/consuela/ConsuelaLogo';
import ConsuelaQualityBenchmark from '@/components/suite/consuela/ConsuelaQualityBenchmark';
import '@/components/suite/about/aboutSuite.css';
import '@/components/suite/consuela/consuelaAdvisor.css';
export default function ConsuelaAdvisorModal({ isOpen, onClose, nodes }) {
  const [activeTab, setActiveTab] = useState('advisor');
  const dialog = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    return () => { element.close(); document.body.style.overflow = overflow; };
  }, [isOpen]);
  if (!isOpen) return null;
  return <dialog ref={dialog} aria-labelledby="consuela-title" className="about-suite consuela-advisor bg-background text-foreground" onCancel={onClose} onClick={event => { if (event.target === dialog.current) { const r = dialog.current.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose(); } }}>
    <div className="consuela-advisor-top">
      <div className="flex items-center gap-3 pr-8"><ConsuelaLogo className="w-12 h-12" /><div className="min-w-0"><h3 id="consuela-title" className="text-base sm:text-lg font-black">Consuela — Suite Project Advisor</h3><p className="text-xs text-primary font-mono mt-1">Autonomous Architecture & Magna Dev Quality Crucible</p></div></div>
      <button onClick={onClose} aria-label="Close Consuela advisor" className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2">✕</button>
      <div className="flex flex-wrap gap-2 border-b border-border pb-3 mt-4" aria-label="Advisor sections">
        {[['advisor', 'Project Matchmaker'], ['benchmark', 'Test Magna Dev Quality (Live)']].map(([id, label]) => <button key={id} aria-pressed={activeTab === id} onClick={() => setActiveTab(id)} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === id ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground hover:text-foreground'}`}>{label}</button>)}
      </div>
    </div>
    <div className="consuela-advisor-content">
      <div hidden={activeTab !== 'advisor'}><ConsuelaMatchmaker nodes={nodes} /></div>
      <div hidden={activeTab !== 'benchmark'}><ConsuelaQualityBenchmark /></div>
    </div>
  </dialog>;
}