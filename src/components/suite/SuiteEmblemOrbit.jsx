import React, { useEffect, useRef, useState } from 'react';
import HolographicCarousel from '@/components/suite/HolographicCarousel';
import suiteOrbitLayout from '@/components/suite/suiteOrbitLayout';

export default function SuiteEmblemOrbit({ nodes, angle, selected, handlers, motion, paused, onTogglePaused, onSelect, onLaunch }) {
  const host = useRef(null), [width, setWidth] = useState(950);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(host.current); return () => observer.disconnect();
  }, []);
  return (
    <div ref={host} className="suite-orbit" {...handlers} aria-label="Sovereign suite emblem carousel">
      <HolographicCarousel nodes={nodes} angle={angle} selected={selected} />
      {nodes.map((node, index) => {
        const { x, y, depth, scale } = suiteOrbitLayout(width, index, angle, nodes.length);
        return <button key={node.id} type="button" className="suite-node" aria-label={`Select ${node.name}`} aria-pressed={index === selected}
          style={{ '--emblem-color': node.color, transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`, opacity: .68 + depth * .32, zIndex: Math.round(depth * 30) + 1 }}
          onClick={(event) => { event.stopPropagation(); if (motion.current.moved) { motion.current.moved = false; return; } onSelect(index); }}
          onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); onSelect((index + (event.key === 'ArrowRight' ? 1 : -1) + nodes.length) % nodes.length); } }}
          onDoubleClick={() => onLaunch(node.subpath)}>
          <span className="suite-node-copy">{node.name}</span>
        </button>;
      })}
      <button type="button" className="suite-orbit-control" data-orbit-control="true" onClick={onTogglePaused} aria-pressed={paused}>
        {paused ? 'Resume rotation' : 'Pause rotation'}
      </button>
    </div>
  );
}