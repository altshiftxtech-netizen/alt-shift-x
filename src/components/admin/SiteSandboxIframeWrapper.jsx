import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, RefreshCw, Shield } from 'lucide-react';

export default function SiteSandboxIframeWrapper({ title, subpath, publicUrl, accentColor, latency = 'Unknown', status = 'UNVERIFIED' }) {
  const [frameState, setFrameState] = useState('loading');
  const [retryKey, setRetryKey] = useState(0);
  const timeout = useRef(null);
  useEffect(() => {
    timeout.current = setTimeout(() => setFrameState('unavailable'), 10000);
    return () => clearTimeout(timeout.current);
  }, [retryKey]);
  const finish = (state) => { clearTimeout(timeout.current); setFrameState(state); };
  const verifyFrame = (event) => {
    // A load event also fires for blocked frames; never reveal on load alone.
    try {
      const doc = event.currentTarget.contentDocument;
      const location = event.currentTarget.contentWindow.location;
      finish(doc?.body?.children.length && location.protocol.startsWith('http') ? 'ready' : 'unavailable');
    } catch {
      // Cross-origin content cannot be inspected safely, so keep it covered.
      finish('unavailable');
    }
  };
  const retry = () => { setFrameState('loading'); setRetryKey((key) => key + 1); };
  return (
    <div className="dark relative w-full h-[420px] rounded-2xl bg-background text-foreground border border-border overflow-hidden">
      {frameState !== 'unavailable' && <iframe key={retryKey} src={publicUrl} title={`${title} Live Sandbox`} className={`absolute inset-0 w-full h-full border-0 bg-background ${frameState === 'ready' ? 'visible' : 'invisible'}`} sandbox="allow-scripts allow-same-origin allow-forms" referrerPolicy="no-referrer" onLoad={verifyFrame} onError={() => finish('unavailable')} />}
      {frameState !== 'ready' && (
        <div className="absolute inset-0 bg-background p-6 flex flex-col justify-between text-center select-none z-20" aria-live="polite">
          <div className="flex items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
            <span>{status} ({latency})</span><span className="px-2 py-0.5 rounded bg-muted border border-border">{subpath}</span>
          </div>
          <div className="my-auto py-4">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-primary text-primary-foreground shadow-lg" style={accentColor ? { backgroundColor: accentColor } : undefined}><Shield className="w-6 h-6" /></div>
            <h4 className="text-base font-black">{title}</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">{frameState === 'loading' ? 'Checking whether this node can be displayed securely…' : 'This embedded preview could not be verified. Browser restrictions, cross-domain isolation, or a loading problem may prevent display. Open the node directly to view it.'}</p>
          </div>
          <div className="space-y-2">
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-xs font-black shadow-md flex items-center justify-center gap-1.5">Launch Live Node Window <ExternalLink className="w-3.5 h-3.5" /></a>
            <button type="button" onClick={retry} disabled={frameState === 'loading'} className="w-full py-1.5 rounded-lg bg-muted hover:bg-accent text-muted-foreground text-[11px] font-mono flex items-center justify-center gap-1 disabled:opacity-50"><RefreshCw className={`w-3 h-3 ${frameState === 'loading' ? 'animate-spin' : ''}`} />{frameState === 'loading' ? 'Checking Frame…' : 'Retry Frame Handshake'}</button>
          </div>
        </div>
      )}
    </div>
  );
}