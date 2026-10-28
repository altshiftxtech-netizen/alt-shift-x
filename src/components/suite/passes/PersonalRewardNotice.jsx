import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
export default function PersonalRewardNotice({ tierId, nodeId, secondNodeId }) {
  const { user } = useAuth(), [quote, setQuote] = useState(null);
  useEffect(() => {
    let live = true; setQuote(null); if (!user) return;
    const nodeIds = tierId === 'apex' ? undefined : tierId === 'duo' ? [nodeId, secondNodeId] : [nodeId];
    base44.functions.invoke('createPassCheckoutSession', { tierId, nodeIds, quoteOnly: true }).then(({ data }) => { if (live) setQuote(data); });
    return () => { live = false; };
  }, [user?.id, tierId, nodeId, secondNodeId]);
  if (!quote?.personalDiscount) return null;
  return <p className="rounded-xl border border-primary bg-primary/10 p-4 text-sm mb-5" role="status">Your 50-success reward is unlocked: 20% off this monthly pass, including renewals. Checkout total: ${(quote.expectedAmount / 100).toFixed(2)}/month. Does not stack with the community discount.</p>;
}