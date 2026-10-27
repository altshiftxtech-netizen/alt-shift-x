import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
export default function useRobotWaveReward() {
  const [open, setOpen] = useState(false);
  const wave = useRef(null);
  useEffect(() => {
    let mounted = true, ready = false, checkedAt = 0, checking = false;
    const test = new URLSearchParams(window.location.search).get('wave_test');
    let shard = sessionStorage.getItem('robot-wave-shard');
    if (!shard || !/^([0-9]|[1-5][0-9]|6[0-3])$/.test(shard)) { shard = String(crypto.getRandomValues(new Uint32Array(1))[0] % 64); sessionStorage.setItem('robot-wave-shard', shard); }
    const roomId = test && /^[a-f0-9-]{36}$/.test(test) ? `robot-waves-qa-${test}` : `robot-waves-v1-${shard}`;
    let id = sessionStorage.getItem('robot-wave-connection');
    if (!id) { id = crypto.randomUUID(); sessionStorage.setItem('robot-wave-connection', id); }
    const room = base44.actors.RobotWaveRoom(roomId).connect({ id });
    const sub = room.subscribe(async msg => {
      if (msg.type === 'ready') ready = true;
      if (msg.type !== 'accepted' || test || checking || Date.now() - checkedAt < 15000 || sessionStorage.getItem('robot-wave-reward-seen')) return;
      checking = true; checkedAt = Date.now();
      try { const response = await base44.functions.invoke('getRobotWaveReward', {}); if (mounted && response.data?.unlocked) setOpen(true); }
      catch (error) { console.error('Robot reward status:', error.message); }
      finally { checking = false; }
    });
    wave.current = robotId => { if (ready) room.send({ type: 'wave', robotId, eventId: crypto.randomUUID() }); };
    return () => { mounted = false; wave.current = null; sub.unsubscribe(); room.close(); };
  }, []);
  const dismiss = value => { if (!value) sessionStorage.setItem('robot-wave-reward-seen', '1'); setOpen(value); };
  return { wave, open, dismiss };
}