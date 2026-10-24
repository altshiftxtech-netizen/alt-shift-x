import React from 'react';
import { ChevronDown } from 'lucide-react';
import '@/components/suite/suiteDossier.css';

export default function SuiteNodeDossier({ node, expanded, onToggle, onInteract, onLaunch, onPasses }) {
  return (
    <section className="suite-dossier" data-expanded={expanded} aria-label={`${node.name} details`} onPointerDown={onInteract} onFocusCapture={onInteract}>
      <button type="button" className="suite-dossier-summary" aria-expanded={expanded} aria-controls="suite-node-details" aria-label={`${expanded ? 'Hide' : 'Show'} ${node.name} details`} onClick={onToggle}>
        <img src={node.logo} alt={`${node.name} logo`} className="suite-dossier-logo" />
        <span className="suite-dossier-identity">
          <span className="suite-dossier-title" role="heading" aria-level="2">{node.name}</span>
          <span className="suite-dossier-tagline">{node.tagline}</span>
          <span className="suite-dossier-hint">{expanded ? 'Hide details' : 'Show details'}</span>
        </span>
        <span className="suite-dossier-price"><span>STARTING AT</span><strong>{node.price}</strong></span>
        <ChevronDown className="suite-dossier-chevron" aria-hidden="true" />
      </button>
      {expanded && <div id="suite-node-details" className="suite-dossier-details">
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
      </div>}
    </section>
  );
}