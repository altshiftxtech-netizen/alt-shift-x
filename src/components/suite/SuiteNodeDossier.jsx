import React from 'react';
import '@/components/suite/suiteDossier.css';

export default function SuiteNodeDossier({ node, onInteract, onKeepOpen, onDismiss, onResume, onLaunch, onPasses }) {
  return (
    <section className="suite-dossier" aria-label={`${node.name} details`} onPointerEnter={onKeepOpen} onPointerLeave={onDismiss} onPointerDown={onInteract} onFocusCapture={() => { onKeepOpen(); onInteract(); }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) onDismiss(); }}>
      <div className="suite-dossier-summary">
        <img src={node.logo} alt={`${node.name} logo`} className="suite-dossier-logo" />
        <span className="suite-dossier-identity">
          <span className="suite-dossier-title" role="heading" aria-level="2">{node.name}</span>
          <span className="suite-dossier-tagline">{node.tagline}</span>
        </span>
        <div className="suite-dossier-price"><span>STARTING AT</span><strong>{node.price}</strong><button type="button" className="suite-dossier-resume" onClick={onResume}>Resume rotation</button></div>
      </div>
      <div id="suite-node-details" className="suite-dossier-details">
        <span className="suite-dossier-category" style={{ backgroundColor: `${node.color}20`, color: node.color }}>{node.category}</span>
        <p className="suite-dossier-description">{node.desc}</p>
        <div className="suite-dossier-specs">
          {node.specs.map(spec => <span key={spec}>{spec}</span>)}
          <span className="suite-dossier-included">✓ Sovereign Pass Included</span>
        </div>
        <div className="suite-dossier-actions">
          <button type="button" onClick={() => onLaunch(node.subpath)}>Enter Sovereign Node →</button>
          <button type="button" onClick={onPasses}>View Sovereign Passes</button>
        </div>
      </div>
    </section>
  );
}