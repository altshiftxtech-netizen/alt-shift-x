/** Standalone Cloudflare Worker. Deploy outside the Base44 function runtime. */
const SUITE_ROUTING_MAP = {
  '/dblive': 'https://dblive-sovereign-database.base44.app',
  '/codevault': 'https://code-vault-repository.base44.app',
  '/sourcebridge': 'https://sourcebridge-software-and-data-substrate-network.base44.app',
  '/omnibridge': 'https://smart-agent-flow-chubby.base44.app',
  '/bitfolio': 'https://bitfolio.base44.app',
  '/turimc': 'https://turi-mc.base44.app',
  '/magna': 'https://magna-webapp-and-coder.base44.app',
  '/tgf': 'https://tgf-ai-carousel.base44.app',
};
const MASTER_HUB_ORIGIN = 'https://unlock-agent-flow.base44.app';

function prefixedPath(path, prefix) {
  // Keep network-path URLs and explicit links to other suite nodes untouched.
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const pathname = path.split(/[?#]/, 1)[0];
  if (Object.keys(SUITE_ROUTING_MAP).some(p => pathname === p || pathname.startsWith(p + '/'))) return path;
  return prefix + path;
}

function rewriteAttribute(attribute, prefix) {
  return { element(element) {
    const value = element.getAttribute(attribute);
    if (value) element.setAttribute(attribute, prefixedPath(value, prefix));
  } };
}

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const prefix = Object.keys(SUITE_ROUTING_MAP).find(p => incoming.pathname === p || incoming.pathname.startsWith(p + '/')) || '';
    const origin = prefix ? SUITE_ROUTING_MAP[prefix] : MASTER_HUB_ORIGIN;
    // Assign pathname separately: a path starting with // must never change upstream host.
    const upstreamUrl = new URL(origin);
    upstreamUrl.pathname = prefix ? incoming.pathname.slice(prefix.length) || '/' : incoming.pathname;
    upstreamUrl.search = incoming.search; // Includes the short-lived session_bridge, unchanged.
    const headers = new Headers(request.headers);
    headers.delete('Host');
    headers.set('X-Forwarded-Host', incoming.host);
    headers.set('X-Forwarded-Proto', incoming.protocol.slice(0, -1));
    headers.set('X-Subpath-Prefix', prefix);
    const options = { method: request.method, headers, redirect: 'manual' };
    if (request.method !== 'GET' && request.method !== 'HEAD') options.body = request.body;
    const upstream = await fetch(new Request(upstreamUrl, options));
    const responseHeaders = new Headers(upstream.headers);
    const location = responseHeaders.get('Location');
    if ([301, 302, 303, 307, 308].includes(upstream.status) && location) {
      const destination = new URL(location, upstreamUrl);
      if (destination.origin === upstreamUrl.origin) {
        // Upstream redirects are origin-relative and always need this node's mount.
        responseHeaders.set('Location', prefix + destination.pathname + destination.search + destination.hash);
      }
    }
    // Do not cache token-bearing navigation or leak its query string through referrers.
    if (incoming.searchParams.has('session_bridge')) {
      responseHeaders.set('Cache-Control', 'private, no-store');
      responseHeaders.set('Referrer-Policy', 'no-referrer');
    }
    let response = new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: responseHeaders });
    if (prefix && (responseHeaders.get('Content-Type') || '').includes('text/html')) {
      response = new HTMLRewriter()
        .on('a[href]', rewriteAttribute('href', prefix))
        .on('link[href]', rewriteAttribute('href', prefix))
        .on('script[src]', rewriteAttribute('src', prefix))
        .on('img[src]', rewriteAttribute('src', prefix))
        .on('source[src]', rewriteAttribute('src', prefix))
        .on('video[src]', rewriteAttribute('src', prefix))
        .on('video[poster]', rewriteAttribute('poster', prefix))
        .on('form[action]', rewriteAttribute('action', prefix))
        .transform(response);
    }
    return response;
  },
};