import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useSuiteHandoff() {
  const busy = useRef(false);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');
  const navigate = async (event, app, isCurrent, close) => {
    event.preventDefault();
    if (isCurrent) { close(); return; }
    if (busy.current) return;
    busy.current = true;
    setPending(app.id);
    setError('');
    try {
      const { data } = await base44.functions.invoke('createSessionBridge', { nodeId: app.id });
      const target = new URL(data?.url);
      if (target.origin !== 'https://altshiftx.tech' || target.pathname !== app.path || !target.searchParams.get('session_bridge')) throw new Error('Invalid navigation destination');
      window.location.assign(target.href);
    } catch {
      setError('Unable to prepare a secure handoff. Please try again.');
      busy.current = false;
      setPending(null);
    }
  };
  return { navigate, pending, error };
}