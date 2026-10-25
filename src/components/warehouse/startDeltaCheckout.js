import { base44 } from '@/api/base44Client';

export async function startDeltaCheckout(functionName, payload) {
  const framed = window.self !== window.top;
  const tab = framed ? window.open('', '_blank') : null;
  if (framed && !tab) throw new Error('Allow popups to continue to checkout.');
  if (tab) tab.opener = null;
  try {
    const { data } = await base44.functions.invoke(functionName, payload);
    if (!data?.url) throw new Error(data?.error || 'Could not start checkout. Please try again.');
    if (tab) tab.location.replace(data.url);
    else window.location.assign(data.url);
  } catch (error) {
    tab?.close();
    throw error;
  }
}