import { useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import provingGroundClock from '@/components/suite/provingGroundClock';

export default function useProvingGroundUsage() {
  const tracker = useRef(null);
  const onMusicChange = useCallback(value => tracker.current?.music(value), []);
  useEffect(() => {
    const clock = provingGroundClock(); tracker.current = clock;
    let credential = null, saving = false, disposed = false;
    const flush = async () => {
      if (!credential || saving) return;
      saving = true;
      try { await base44.functions.invoke('recordProvingGroundUsage', { action: 'save', ...credential, ...clock.tick() }); }
      catch (error) { console.warn('Usage totals will retry on the next save:', error.message); }
      finally { saving = false; if (disposed) void finalSave(); }
    };
    const finalSave = async () => {
      if (!credential) return;
      try { await base44.functions.invoke('recordProvingGroundUsage', { action: 'save', ...credential, ...clock.tick() }); }
      catch (error) { console.warn('Final usage save did not complete:', error.message); }
    };
    base44.functions.invoke('recordProvingGroundUsage', { action: 'start' }).then(({ data }) => { credential = data; if (disposed) void finalSave(); }).catch(error => console.warn('Usage tracking unavailable:', error.message));
    const events = ['pointerdown', 'pointermove', 'keydown', 'wheel'];
    events.forEach(event => window.addEventListener(event, clock.interact, { passive: true }));
    const visibility = () => { clock.visibility(); if (document.hidden) void flush(); };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', flush);
    const timer = window.setInterval(flush, 60000);
    return () => {
      clock.stop(); disposed = true; tracker.current = null;
      clearInterval(timer); events.forEach(event => window.removeEventListener(event, clock.interact));
      document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', flush);
      if (!saving) void finalSave();
    };
  }, []);
  return onMusicChange;
}