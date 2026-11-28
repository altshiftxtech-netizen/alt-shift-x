import React, { useRef, useState } from 'react';

export default function RemixFootageDock({ sources, onAdd, onRemove, scanning, disabled }) {
  const input = useRef(null);
  const [link, setLink] = useState('');
  const [dragging, setDragging] = useState(false);
  const blocked = disabled || scanning;
  return <div className="dm-panel">
    <div className="dm-label">Reference Footage &amp; Past Commercials</div>
    <div className="dm-beat" data-active={dragging} onDragOver={e => { e.preventDefault(); if (!blocked) setDragging(true); }}
      onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); if (!blocked) onAdd([...e.dataTransfer.files]); }}>
      <button type="button" className="dm-ghost" disabled={blocked} onClick={() => input.current.click()}>Choose videos or drop them here</button>
      <input ref={input} type="file" hidden multiple accept=".mp4,.mov,.webm" onChange={e => { onAdd([...e.target.files]); e.target.value = ''; }} />
      <p className="dm-note">MP4, MOV and WebM, depending on browser codec support. Local footage stays in this tab.</p>
    </div>
    <form className="dm-row" style={{ marginTop: 10 }} onSubmit={async e => { e.preventDefault(); if (link.trim() && await onAdd([link.trim()])) setLink(''); }}>
      <input className="dm-input flex-1" aria-label="Direct reference video URL" type="url" placeholder="Direct HTTPS video URL" value={link} onChange={e => setLink(e.target.value)} disabled={blocked} />
      <button className="dm-ghost" type="submit" disabled={blocked || !link.trim()}>Add link</button>
    </form>
    <p className="dm-note">Direct links must allow browser access. For YouTube, add a file you own or have permission to reuse.</p>
    {scanning && <p className="dm-note" role="status">Scanning reference footage for cuts and motion…</p>}
    {sources.map(source => <div className="dm-beat mt-3" key={source.url}>
      <div className="dm-row-between"><span className="break-all">{source.name}</span><button className="dm-ghost" type="button" onClick={() => onRemove(source.url)} disabled={blocked}>Remove</button></div>
      <div className="mt-2 grid grid-cols-3 gap-1 sm:grid-cols-6">{source.thumbs.map((url, i) => <img key={i} className="aspect-video w-full object-cover" src={url} alt={`Sample ${i + 1}`} />)}</div>
    </div>)}
  </div>;
}