import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { claimRocketDemo, fuelRocketDemo, loadRocketDemo, saveRocketDemo } from '@/components/suite/game/rocketDemoSession';
import rocketDemoAudio from '@/components/suite/game/rocketDemoAudio';
export default function useRocketDemo() {
  const { user, isAuthenticated } = useAuth();
  const signedIn = Boolean(user && isAuthenticated);
  const [state, setState] = useState(loadRocketDemo);
  const [open, setOpen] = useState(false), [ready, setReady] = useState(false), [phase, setPhase] = useState('Ready');
  const [sound, setSound] = useState(false), [soundError, setSoundError] = useState('');
  const current = useRef(state), bridge = useRef({ launchRequested: false }), audio = useRef(null);
  const commit = next => { current.current = next; saveRocketDemo(next); setState(next); };
  const fuel = () => {
    if (!ready || open) return;
    const next = fuelRocketDemo(current.current, signedIn);
    const milestone = next.launches > current.current.launches;
    commit(next);
    if (milestone) { bridge.current.launchRequested = true; setOpen(true); if (sound) audio.current?.launch(); }
  };
  const claim = tier => commit(claimRocketDemo(current.current, tier));
  const toggleSound = async () => {
    if (sound) { audio.current?.mute(); setSound(false); return; }
    try { audio.current ||= rocketDemoAudio(); await audio.current.enable(); setSound(true); setSoundError(''); }
    catch { setSoundError('Sound unavailable in this browser. The demo still works.'); }
  };
  bridge.current.fuel = fuel; bridge.current.onPhase = setPhase;
  useEffect(() => () => { audio.current?.dispose(); audio.current = null; }, []);
  return { state, signedIn, open, setOpen, ready, setReady, phase, fuel, claim, bridge, sound, soundError, toggleSound };
}