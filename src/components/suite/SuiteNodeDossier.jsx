import React from 'react';
import '@/components/suite/suiteDossier.css';
import suiteNodeTeasers from '@/components/suite/suiteNodeTeasers';

export default function SuiteNodeDossier({ node, onInteract, onKeepOpen, onDismiss, onResume, onLaunch, onPasses }) {
  return (
    <section className="suite-dossier" aria-label={`${node.name} details`} onPointerEnter={onKeepOpen} onPointerLeave={onDismiss} onPointerDown={onInteract} onFocusCapture={() => { onKeepOpen(); onInteract(); }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) onDismiss(); }}>
      <div className="suite-dossier-summary">
        <img src={node.logo} alt={`${node.name} logo`} className="suite-dossier-logo" />
        <span className="suite-dossier-identity">
          <span className="suite-dossier-title" role="heading" aria-level="2">{node.name}</span>
        </span>
        <div className="suite-dossier-price"><strong>{node.price}</strong><button type="button" className="suite-dossier-resume" onClick={onResume}>Resume rotation</button></div>
      </div>
      <div id="suite-node-details" className="suite-dossier-details">
        <p className="suite-dossier-description">{suiteNodeTeasers[node.id]}</p>
        <div className="suite-dossier-actions">
          <button type="button" onClick={() => onLaunch(node.subpath)}>Explore node →</button>
          <button type="button" onClick={onPasses}>View passes</button>
        </div>
      </div>
    </section>
  );
}