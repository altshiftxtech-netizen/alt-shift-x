const ORIGIN = 'https://altshiftx.tech';
const TARGETS = ['codevault', 'dblive', 'bitfolio', 'magna'];

export default function openSuiteBridge(target, component, onStatus) {
  if (!TARGETS.includes(target) || !component) throw new Error('Select or generate a component to bridge');
  const payload = JSON.parse(JSON.stringify(component));
  const requestId = crypto.randomUUID(), expiresAt = Date.now() + 60000;
  const url = new URL(`/${target}`, ORIGIN);
  url.searchParams.set('bridge', requestId);
  url.searchParams.set('source', window.location.origin);
  const popup = window.open(url.href, '_blank');
  if (!popup) throw new Error('Allow popups to open the suite bridge.');
  let sent = false, finished = false, interval, timeout;
  const cleanup = () => {
    clearInterval(interval); clearTimeout(timeout);
    window.removeEventListener('message', receive);
  };
  const finish = (state, message) => { finished = true; cleanup(); onStatus({ state, message }); };
  const receive = event => {
    const data = event.data;
    if (finished || event.origin !== ORIGIN || event.source !== popup || data?.requestId !== requestId || data?.nodeId !== target || Date.now() >= expiresAt) return;
    if (data.type === 'SUITE_BRIDGE_READY' && !sent) {
      sent = true;
      popup.postMessage({ type: 'SUITE_COMPONENT_IMPORT', version: 1, requestId, nodeId: target, expiresAt, payload }, ORIGIN);
      onStatus({ state: 'pending', message: 'Component dispatched; awaiting destination confirmation.' });
    } else if (data.type === 'SUITE_BRIDGE_ACCEPTED' && sent) {
      finish('success', 'Destination confirmed receipt of the component.');
    } else if (data.type === 'SUITE_BRIDGE_REJECTED') {
      finish('error', 'The destination declined the component. Nothing was confirmed.');
    }
  };
  const hello = () => {
    if (popup.closed) { finish('error', 'Destination closed or isolated the bridge connection.'); return; }
    if (!sent) popup.postMessage({ type: 'SUITE_BRIDGE_HELLO', version: 1, requestId, nodeId: target, expiresAt }, ORIGIN);
  };
  window.addEventListener('message', receive);
  onStatus({ state: 'pending', message: `Waiting for ${target} to receive the component…` });
  interval = setInterval(hello, 500);
  timeout = setTimeout(() => finish('error', 'No destination confirmation within 60 seconds. Check that the node is available and its bridge receiver is installed.'), 60000);
  hello();
  return () => { if (!finished) { finished = true; cleanup(); popup.close(); } };
}