import { useEffect, useRef } from 'react';

/**
 * SuiteTelemetrySentinel — passive client-side performance & cost monitor.
 * Mount once at root. Zero cloud tokens. No blocking on initial paint.
 *
 * Hooks:
 *  - Three.js render loop: running avg FPS, auto-throttle GFX level if <45 FPS over 180 frames
 *  - webglcontextlost: prevent crash, log, trigger reinit
 *  - Core Web Vitals: LCP, CLS, FID/INP via PerformanceObserver → ring buffer (last 50)
 *  - Compute dedup: skip identical large payloads within 24h
 *  - Custom event API: window.dispatchEvent(new CustomEvent('ASX_THROTTLE_GFX_LEVEL', ...))
 */
const FPS_SAMPLE_WINDOW = 180;
const FPS_THRESHOLD = 45;
const RING_SIZE = 50;
const DEDUP_TTL = 24 * 60 * 60 * 1000;

function createRing(size) {
  const buf = [];
  return {
    push(v) { buf.push(v); if (buf.length > size) buf.shift(); },
    items: () => [...buf],
    last: () => buf[buf.length - 1],
  };
}

function computePayloadHash(payload) {
  try { return JSON.stringify(payload); } catch { return String(payload); }
}

export default function SuiteTelemetrySentinel() {
  const rafRef = useRef(0);
  const frameTimesRef = useRef([]);
  const lastFrameRef = useRef(0);
  const throttledRef = useRef(false);
  const webVitalsRef = useRef(createRing(RING_SIZE));
  const computeCacheRef = useRef(new Map());

  useEffect(() => {
    // ── 1. Passive RAF FPS sampler (runs in micro-task, no blocking) ──
    const sampleFrame = (now) => {
      rafRef.current = requestAnimationFrame(sampleFrame);
      if (document.hidden) { lastFrameRef.current = 0; return; }
      if (lastFrameRef.current > 0) {
        const delta = now - lastFrameRef.current;
        frameTimesRef.current.push(delta);
        if (frameTimesRef.current.length > FPS_SAMPLE_WINDOW) frameTimesRef.current.shift();
        // ── Autonomous throttle check ──
        if (frameTimesRef.current.length >= FPS_SAMPLE_WINDOW && !throttledRef.current) {
          const avgDelta = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
          const avgFps = 1000 / avgDelta;
          if (avgFps < FPS_THRESHOLD) {
            throttledRef.current = true;
            window.dispatchEvent(new CustomEvent('ASX_THROTTLE_GFX_LEVEL', {
              detail: { targetDPR: 1.0, shadowMap: false, avgFps: Math.round(avgFps) }
            }));
          }
        }
      }
      lastFrameRef.current = now;
    };
    rafRef.current = requestAnimationFrame(sampleFrame);

    // ── 2. WebGL context loss guard ──
    const handleContextLost = (e) => {
      e.preventDefault();
      console.warn('[ASX Sentinel] WebGL context lost — auto-reinit triggered');
      window.dispatchEvent(new CustomEvent('ASX_WEBGL_CONTEXT_LOST', { detail: { timestamp: Date.now() } }));
    };
    const handleContextRestored = () => {
      console.info('[ASX Sentinel] WebGL context restored');
      throttledRef.current = false;
      frameTimesRef.current = [];
    };
    const canvases = document.querySelectorAll('canvas');
    const attachCanvasListeners = () => {
      document.querySelectorAll('canvas').forEach((c) => {
        if (!c.dataset.asxSentinel) {
          c.dataset.asxSentinel = '1';
          c.addEventListener('webglcontextlost', handleContextLost);
          c.addEventListener('webglcontextrestored', handleContextRestored);
        }
      });
    };
    attachCanvasListeners();
    const canvasObserver = new MutationObserver(attachCanvasListeners);
    canvasObserver.observe(document.body, { childList: true, subtree: true });

    // ── 3. Core Web Vitals via PerformanceObserver ──
    const pushVital = (name, value) => {
      webVitalsRef.current.push({ name, value, ts: Date.now() });
      window.dispatchEvent(new CustomEvent('ASX_VITAL', { detail: { name, value } }));
    };
    const lcpObs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) pushVital('LCP', last.startTime);
    });
    try { lcpObs.observe({ type: 'largest-contentful-paint', buffered: true }); } catch {}

    const clsObs = new PerformanceObserver((list) => {
      let cls = 0;
      list.getEntries().forEach((e) => { cls += e.value; });
      pushVital('CLS', cls);
    });
    try { clsObs.observe({ type: 'layout-shift', buffered: true }); } catch {}

    const fidObs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((e) => pushVital('FID', e.processingStart - e.startTime));
    });
    try { fidObs.observe({ type: 'first-input', buffered: true }); } catch {}

    // ── 4. Compute dedup listener ──
    const handleComputeCheck = (e) => {
      const { payload, operationId = 'default' } = e.detail || {};
      if (!payload) return;
      const hash = computePayloadHash(payload);
      const now = Date.now();
      const cache = computeCacheRef.current;
      const key = `${operationId}:${hash}`;
      const entry = cache.get(key);
      if (entry && (now - entry.ts) < DEDUP_TTL) {
        window.dispatchEvent(new CustomEvent('ASX_COMPUTE_DEDUP_HIT', {
          detail: { operationId, age: now - entry.ts }
        }));
        e.detail.isDuplicate = true;
      } else {
        cache.set(key, { ts: now });
        // Prune stale entries
        for (const [k, v] of cache) {
          if (now - v.ts > DEDUP_TTL) cache.delete(k);
        }
      }
    };
    window.addEventListener('ASX_COMPUTE_CHECK', handleComputeCheck);

    // ── 5. Expose sentinel API on window for pages to query ──
    window.__asxSentinel = {
      getVitals: () => webVitalsRef.current.items(),
      getAvgFps: () => {
        const ft = frameTimesRef.current;
        if (ft.length < 2) return null;
        return Math.round(1000 / (ft.reduce((a, b) => a + b, 0) / ft.length));
      },
      isThrottled: () => throttledRef.current,
      checkDuplicate: (payload, operationId = 'default') => {
        const hash = computePayloadHash(payload);
        const now = Date.now();
        const key = `${operationId}:${hash}`;
        const entry = computeCacheRef.current.get(key);
        return !!(entry && (now - entry.ts) < DEDUP_TTL);
      },
    };

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvasObserver.disconnect();
      [lcpObs, clsObs, fidObs].forEach((o) => o.disconnect());
      window.removeEventListener('ASX_COMPUTE_CHECK', handleComputeCheck);
      document.querySelectorAll('canvas[data-asx-sentinel]').forEach((c) => {
        c.removeEventListener('webglcontextlost', handleContextLost);
        c.removeEventListener('webglcontextrestored', handleContextRestored);
      });
      delete window.__asxSentinel;
    };
  }, []);

  return null;
}