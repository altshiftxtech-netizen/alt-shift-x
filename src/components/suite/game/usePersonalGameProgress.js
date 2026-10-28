import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
export default function usePersonalGameProgress() {
  const { user } = useAuth(), bridge = useRef({});
  const [state, setState] = useState({ successes: 0, planted: [], unlocked: false });
  const [error, setError] = useState(''), [loading, setLoading] = useState(false);
  const request = async payload => {
    setError('');
    try { const { data } = await base44.functions.invoke('personalGameProgress', payload); setState(data); return data; }
    catch (e) { setError(e.response?.data?.error || 'Progress could not be saved. Please retry.'); return null; }
  };
  useEffect(() => {
    setState({ successes: 0, planted: [], unlocked: false });
    if (!user) return;
    let live = true; setLoading(true);
    base44.functions.invoke('personalGameProgress', { action: 'status' }).then(({ data }) => { if (live) setState(data); }).catch(() => { if (live) setError('Could not load progress. Use Refresh progress.'); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [user?.id]);
  bridge.current = { ...state, signedIn: !!user, loading,
    start: (kind, target) => user ? request({ action: 'start', kind, target }) : Promise.resolve({ challenge: 'practice' }),
    finish: challenge => request({ action: 'finish', challenge }),
  };
  return { bridge, state, error, loading, signedIn: !!user, refresh: () => request({ action: 'status' }) };
}