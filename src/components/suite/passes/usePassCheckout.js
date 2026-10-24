import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
export default function usePassCheckout(nodeId, secondNodeId) {
  const [busy, setBusy] = useState(null), [error, setError] = useState('');
  const pending = useRef(false);
  const activate = async tier => {
    if (pending.current) return;
    pending.current = true; setBusy(tier.id); setError('');
    const framed = window.self !== window.top;
    const tab = framed ? window.open('', '_blank') : null;
    try {
      if (framed && !tab) throw new Error('Allow popups to continue to checkout.');
      if (tab) tab.opener = null;
      const returnTo = `/sovereignpass?tier=${tier.id}&node=${nodeId}&second=${secondNodeId}`;
      if (!await base44.auth.isAuthenticated()) { tab?.close(); window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`; return; }
      const nodeIds = tier.id === 'apex' ? undefined : tier.id === 'duo' ? [nodeId, secondNodeId] : [nodeId];
      const response = await base44.functions.invoke('createPassCheckoutSession', { tierId: tier.id, nodeIds });
      if (!response.data?.checkoutUrl) throw new Error(response.data?.error || 'Checkout could not be created.');
      if (tab) tab.location.replace(response.data.checkoutUrl);
      else window.location.assign(response.data.checkoutUrl);
    } catch (err) {
      tab?.close();
      const status = err.response?.status;
      if (status === 401) window.location.href = `/login?returnTo=${encodeURIComponent(`/sovereignpass?tier=${tier.id}&node=${nodeId}&second=${secondNodeId}`)}`;
      else setError(err.response?.data?.error || err.message || 'Unable to open checkout. Please retry.');
    } finally { pending.current = false; setBusy(null); }
  };
  return { busy, error, activate };
}