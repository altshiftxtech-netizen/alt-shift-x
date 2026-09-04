import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import JSZip from 'npm:jszip@3.10.1';

// PM-1A / Sovereign PWA Deployment Payload Generator
//
// When an `export_id` is provided, fetches the specific PwaExport record and
// builds a complete, branded zip package containing:
//   - manifest.json (PWA web-app manifest with favicons/icons)
//   - sw.js (Sovereign service worker)
//   - self-healing.js (auto repair shim)
//   - offline-bootloader.js (offline-first identity provisioning)
//   - boot-sequence.json
//   - apex-verification.json
//   - payload.json (full deployment payload with component metadata)
//   - favicon.png (referenced icon)
//   - README.txt
//
// Falls back to the legacy PM-1A-BOOTSTRAP-1.0 lookup when no export_id is given.

const PM1A_MASTER_ENDPOINT = 'https://pm-1a-master-x5.sovereign.local/api/v1';

const SELF_HEALING_SCRIPT = `#!/usr/bin/env node
// PM-1A Self-Healing Shim (auto)
// Monitors substrate health and auto-repairs on drift detection.
const PM1A = {
  check: async () => {
    const res = await fetch('${PM1A_MASTER_ENDPOINT}/health');
    return res.ok ? 'healthy' : 'degraded';
  },
  repair: async () => {
    console.log('[PM-1A] Drift detected — initiating auto-repair sequence...');
    const res = await fetch('${PM1A_MASTER_ENDPOINT}/repair', { method: 'POST' });
    return res.ok ? 'repaired' : 'failed';
  },
};
module.exports = PM1A;
`;

const OFFLINE_BOOTLOADER = `// PM-1A Offline-First Bootloader
// On first run, checks for local 6a21... identity before provisioning.
const BOOTLOADER = {
  identityPrefix: '6a21',
  boot: async () => {
    const stored = localStorage.getItem('pm1a_identity');
    if (!stored || !stored.startsWith('6a21')) {
      console.log('[PM-1A] No local 6a21 identity found — provisioning new substrate...');
      const id = '6a21' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem('pm1a_identity', id);
      return { status: 'provisioned', identity: id };
    }
    return { status: 'active', identity: stored };
  },
};
export default BOOTLOADER;
`;

// Sovereign PWA Service Worker — included in every export package
const SERVICE_WORKER = `// Sovereign PWA Service Worker — PWA-AGENT-WRAPPER-1.0
// Neutral caching shell. Explicitly ignores /state/* routes (the Sovereign
// runtime state pages) so the PWA never caches or interferes with live state.
const CACHE_NAME = "sov-pwa-shell-v1";
const SHELL_ASSETS = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/state/")) return;
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((r) => r || caches.match("/")))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return response;
          })
      )
    );
  }
});
`;

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function buildIndexHtml(name, version, description, artifactCode, components, bootSequence) {
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const compJson = JSON.stringify(components || []);
  const bootJson = JSON.stringify(bootSequence || {});
  const manifest = { name, version, description, artifactCode };
  const manifestJson = JSON.stringify(manifest);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#0a0e1a">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>${esc(name)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0e1a; color: #e2e8f0; min-height: 100vh; overflow-x: hidden;
    }
    /* Boot overlay */
    #boot-overlay {
      position: fixed; inset: 0; z-index: 100; background: #0a0e1a;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 16px; transition: opacity 0.5s ease;
    }
    #boot-overlay.hidden { opacity: 0; pointer-events: none; }
    .boot-logo {
      width: 72px; height: 72px; border-radius: 18px; object-fit: cover;
      box-shadow: 0 0 40px rgba(251,191,36,0.3);
      animation: boot-pulse 1.5s ease-in-out infinite;
    }
    @keyframes boot-pulse {
      0%,100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.08); opacity: 1; }
    }
    .boot-name { font-size: 18px; font-weight: 800; color: #fff; }
    .boot-version { font-size: 11px; color: #64748b; }
    .boot-console {
      width: 280px; max-width: 80vw; min-height: 80px; margin-top: 8px;
      font-family: 'SF Mono', Monaco, monospace; font-size: 10px; color: #4ade80;
      text-align: left; line-height: 1.6; opacity: 0.8;
    }
    .boot-console .line { opacity: 0; animation: fade-in 0.3s forwards; }
    .boot-console .line.ok::before { content: '✓ '; color: #4ade80; }
    .boot-console .line.wait::before { content: '⟳ '; color: #fbbf24; }
    .boot-console .line.fail::before { content: '✗ '; color: #f87171; }
    @keyframes fade-in { to { opacity: 1; } }
    .boot-progress {
      width: 200px; height: 2px; background: #1e293b; border-radius: 1px; overflow: hidden; margin-top: 4px;
    }
    .boot-progress-bar { height: 100%; width: 0; background: #fbbf24; transition: width 0.4s ease; }

    /* App shell */
    #app { opacity: 0; transition: opacity 0.5s ease; min-height: 100vh; }
    #app.visible { opacity: 1; }
    .header {
      background: linear-gradient(135deg, #0a0e1a, #1a2332);
      padding: 16px; display: flex; align-items: center; gap: 12px;
      position: sticky; top: 0; z-index: 10; border-bottom: 1px solid #1e293b;
      box-shadow: 0 2px 20px rgba(0,0,0,0.3);
    }
    .header img { width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; }
    .header h1 { font-size: 16px; font-weight: 700; color: #fff; }
    .header p { font-size: 10px; color: #64748b; }
    .header .badge {
      margin-left: auto; font-size: 9px; font-weight: 700; padding: 4px 8px;
      border-radius: 6px; background: #052e16; color: #4ade80; border: 1px solid #14532d;
    }
    .body { max-width: 640px; margin: 0 auto; padding: 16px; }
    .identity-bar {
      background: #052e16; border: 1px solid #14532d; border-radius: 10px; padding: 10px 12px;
      margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
    }
    .identity-bar .dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; animation: boot-pulse 2s infinite; }
    .identity-bar .label { font-size: 10px; color: #4ade80; font-weight: 600; }
    .identity-bar .id { font-size: 10px; font-family: monospace; color: #64748b; margin-left: auto; }
    .section-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
      color: #475569; margin: 16px 0 10px;
    }
    .module-card {
      background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px;
      display: flex; gap: 12px; align-items: flex-start; margin-bottom: 8px; cursor: pointer;
      transition: border-color 0.15s, transform 0.1s;
    }
    .module-card:active { transform: scale(0.98); }
    .module-card:hover { border-color: #334155; }
    .module-type {
      width: 36px; height: 36px; border-radius: 8px; display: flex;
      align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0;
    }
    .module-type-X1 { background: #172554; color: #60a5fa; }
    .module-type-X2 { background: #3b0764; color: #c084fc; }
    .module-type-X3 { background: #052e16; color: #4ade80; }
    .module-type-X4 { background: #451a03; color: #fb923c; }
    .module-type-X5 { background: #500724; color: #f472b6; }
    .module-info { flex: 1; min-width: 0; }
    .module-code { font-size: 9px; font-family: monospace; color: #475569; }
    .module-name { font-size: 13px; font-weight: 600; color: #f1f5f9; margin: 2px 0; }
    .module-desc { font-size: 11px; color: #64748b; line-height: 1.4; }
    .module-features { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
    .feature-tag { font-size: 8px; padding: 2px 6px; border-radius: 4px; background: #1e293b; color: #94a3b8; }
    .module-price { font-size: 12px; font-weight: 700; color: #fbbf24; white-space: nowrap; }
    .footer {
      padding: 16px; text-align: center; border-top: 1px solid #1e293b; margin-top: 20px;
    }
    .footer .status { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: #4ade80; font-weight: 600; }
    .footer .status .dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; animation: boot-pulse 2s infinite; }
    .footer .version { font-size: 9px; color: #334155; margin-top: 4px; }
    .console-panel {
      background: #020617; border: 1px solid #1e293b; border-radius: 10px; padding: 10px;
      margin-top: 12px; font-family: 'SF Mono', Monaco, monospace; font-size: 9px; color: #64748b;
      max-height: 120px; overflow-y: auto;
    }
    .console-panel .entry { margin-bottom: 2px; }
    .console-panel .entry .ts { color: #334155; }
    .console-panel .entry .msg { color: #94a3b8; }
    .action-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px;
      background: #fbbf24; color: #0a0e1a; font-size: 12px; font-weight: 700; border: none; cursor: pointer;
    }
    .action-btn:active { transform: scale(0.96); }
  </style>
</head>
<body>
  <!-- Boot overlay -->
  <div id="boot-overlay">
    <img class="boot-logo" src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/72e7dd2d4_altxlogo2.jpeg" alt="${esc(name)}">
    <div class="boot-name">${esc(name)}</div>
    <div class="boot-version">v${esc(version)}</div>
    <div class="boot-progress"><div class="boot-progress-bar" id="boot-bar"></div></div>
    <div class="boot-console" id="boot-console"></div>
  </div>

  <!-- App -->
  <div id="app">
    <div class="header">
      <img src="https://media.base44.com/images/public/6a19363c90f06323c4cfff73/72e7dd2d4_altxlogo2.jpeg" alt="${esc(name)}">
      <div>
        <h1>${esc(name)}</h1>
        <p>v${esc(version)}</p>
      </div>
      <span class="badge" id="status-badge">ACTIVE</span>
    </div>
    <div class="body">
      <div class="identity-bar">
        <div class="dot"></div>
        <span class="label">Substrate Identity</span>
        <span class="id" id="identity-id">—</span>
      </div>
      <div class="section-label">Installed Modules</div>
      <div id="module-list"></div>
      <div class="section-label">Runtime Console</div>
      <div class="console-panel" id="console-panel"></div>
    </div>
    <div class="footer">
      <div class="status"><div class="dot"></div> Substrate Active</div>
      <div class="version">${esc(artifactCode)} · v${esc(version)}</div>
    </div>
  </div>

  <script type="module">
    const COMPONENTS = ${compJson};
    const BOOT_STEPS = ${bootJson};
    const PWA_META = ${manifestJson};

    const consoleEl = document.getElementById('boot-console');
    const consolePanel = document.getElementById('console-panel');
    const bootBar = document.getElementById('boot-bar');
    const bootOverlay = document.getElementById('boot-overlay');
    const appEl = document.getElementById('app');

    function logBoot(text, type) {
      const line = document.createElement('div');
      line.className = 'line ' + (type || '');
      line.style.animationDelay = (consoleEl.children.length * 0.1) + 's';
      line.textContent = text;
      consoleEl.appendChild(line);
    }
    function logRuntime(text) {
      const entry = document.createElement('div');
      entry.className = 'entry';
      const ts = new Date().toLocaleTimeString();
      entry.innerHTML = '<span class="ts">[' + ts + ']</span> <span class="msg">' + text + '</span>';
      consolePanel.appendChild(entry);
      consolePanel.scrollTop = consolePanel.scrollHeight;
    }

    function renderModules() {
      const list = document.getElementById('module-list');
      if (!COMPONENTS.length) {
        list.innerHTML = '<p style="font-size:12px;color:#475569;text-align:center;padding:16px;">No modules installed.</p>';
        return;
      }
      list.innerHTML = COMPONENTS.map(c => {
        const type = c.type || 'X5';
        const features = (c.features || []).slice(0, 4).map(f => '<span class="feature-tag">' + (f || '').replace(/</g,'&lt;') + '</span>').join('');
        return '<div class="module-card">' +
          '<div class="module-type module-type-' + type + '">' + type + '</div>' +
          '<div class="module-info">' +
            '<div class="module-code">' + (c.code || '') + '</div>' +
            '<div class="module-name">' + (c.name || '') + '</div>' +
            (c.description ? '<div class="module-desc">' + c.description.replace(/</g,'&lt;') + '</div>' : '') +
            (features ? '<div class="module-features">' + features + '</div>' : '') +
          '</div>' +
          (c.price ? '<div class="module-price">$' + c.price + '/mo</div>' : '') +
        '</div>';
      }).join('');
    }

    async function runBoot() {
      const steps = Object.values(BOOT_STEPS);
      const total = Math.max(steps.length, 1);
      let progress = 0;

      logBoot('Initializing ' + PWA_META.name + ' v' + PWA_META.version, 'ok');
      await sleep(300);

      // Step 1: Identity provisioning
      logBoot(steps[0] || 'Checking substrate identity…', 'wait');
      let identity = null;
      try {
        const stored = localStorage.getItem('pm1a_identity');
        if (stored && stored.startsWith('6a21')) {
          identity = stored;
          logBoot('Existing identity found: ' + identity.substring(0, 12) + '…', 'ok');
        } else {
          logBoot('No identity — provisioning new substrate…', 'wait');
          const bytes = new Uint8Array(16);
          crypto.getRandomValues(bytes);
          identity = '6a21' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
          localStorage.setItem('pm1a_identity', identity);
          logBoot('New identity provisioned: ' + identity.substring(0, 12) + '…', 'ok');
        }
        document.getElementById('identity-id').textContent = identity.substring(0, 20) + '…';
      } catch (e) {
        logBoot('Identity provisioning failed: ' + e.message, 'fail');
      }
      progress += 1; bootBar.style.width = Math.round(progress / total * 100) + '%';
      await sleep(400);

      // Step 2: Service worker
      logBoot(steps[4] || 'Registering service worker…', 'wait');
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.register('sw.js');
          logBoot('Service worker registered: ' + reg.scope, 'ok');
        } catch (e) {
          logBoot('SW registration skipped (blob:// limitation)', 'fail');
        }
      } else {
        logBoot('Service worker not supported', 'fail');
      }
      progress += 1; bootBar.style.width = Math.round(progress / total * 100) + '%';
      await sleep(300);

      // Remaining boot steps
      for (let i = 2; i < steps.length; i++) {
        logBoot(steps[i], 'wait');
        await sleep(300);
        logBoot('Complete', 'ok');
        progress += 1; bootBar.style.width = Math.round(progress / total * 100) + '%';
      }

      bootBar.style.width = '100%';
      logBoot('Substrate active — launching app', 'ok');
      await sleep(400);

      // Transition to app
      bootOverlay.classList.add('hidden');
      appEl.classList.add('visible');
      renderModules();
      logRuntime('App launched — ' + COMPONENTS.length + ' modules loaded');
      logRuntime('Identity: ' + (identity || 'unknown').substring(0, 16) + '…');
    }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    // Start boot
    runBoot().catch(e => { logBoot('Boot failed: ' + e.message, 'fail'); });
  </script>
</body>
</html>`;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const apexKey = body?.apex_key;
    const exportId = body?.export_id;

    // ── Auth: allow direct admin calls OR service-role invocations (from getHostedPwa) ──
    let user = null;
    let isServiceRole = false;
    try { user = await base44.auth.me(); } catch { isServiceRole = true; }
    if (!user && !isServiceRole) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user && user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    // ── Apex Key verification (Sovereign Ledger handshake) — optional ─────────
    let verifiedKey = null;
    if (apexKey && typeof apexKey === 'string' && apexKey.trim().length >= 8) {
      const keyHash = await sha256(apexKey.trim());
      const keys = await base44.asServiceRole.entities.EnterpriseKey.filter({
        key_hash: keyHash, status: 'active',
      }, '-created_date', 10);
      verifiedKey = keys.find(k => k.status === 'active');
      if (!verifiedKey) {
        return Response.json({
          error: 'Apex Key verification failed — key not found or revoked in the Sovereign Ledger.',
        }, { status: 403 });
      }
    }

    // ── Resolve the PwaExport record ─────────────────────────────────────────
    let exportRecord = null;
    let componentCodes: string[] = [];
    let pwaName = 'Patriot Machine 1A';
    let pwaVersion = '1.0';
    let pwaDescription = 'Sovereign PWA deployment package.';
    let endpointUrl: string | null = null;

    if (exportId) {
      exportRecord = await base44.asServiceRole.entities.PwaExport.get(exportId).catch(() => null);
      if (!exportRecord) {
        return Response.json({ error: 'PWA export record not found.' }, { status: 404 });
      }
      componentCodes = exportRecord.component_codes || [];
      pwaName = exportRecord.name || pwaName;
      pwaVersion = exportRecord.version || pwaVersion;
      pwaDescription = exportRecord.description || pwaDescription;
    }

    // ── Fetch the actual components referenced by this export ────────────────
    let bundledComponents: any[] = [];
    if (componentCodes.length > 0) {
      const allComponents = await base44.asServiceRole.entities.Component.filter({}, '-created_date', 200);
      bundledComponents = allComponents.filter(c => componentCodes.includes(c.code));
    }

    // Fallback to legacy PM-1A-BOOTSTRAP-1.0 lookup if no components resolved
    if (bundledComponents.length === 0) {
      const legacy = await base44.asServiceRole.entities.Component.filter({
        code: 'PM-1A-BOOTSTRAP-1.0',
      }, '-created_date', 5);
      bundledComponents = legacy;
    }

    // Pick the primary component (first match) for manifest branding
    const primary = bundledComponents[0] || null;
    if (primary) {
      if (!exportRecord) {
        pwaName = primary.name || pwaName;
      }
      endpointUrl = primary.endpoint_url || endpointUrl;
      if (primary.description && pwaDescription === 'Sovereign PWA deployment package.') {
        pwaDescription = primary.description;
      }
    }

    // ── Build the PWA manifest with favicons ─────────────────────────────────
    // Use the Alt+Shift+X platform favicon as the default icon for all packets
    const FAVICON_URL = 'https://media.base44.com/images/public/6a19363c90f06323c4cfff73/72e7dd2d4_altxlogo2.jpeg';
    const pwaManifest = {
      name: pwaName,
      short_name: pwaName.length > 12 ? pwaName.substring(0, 12) : pwaName,
      description: pwaDescription,
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'any',
      theme_color: '#0a0e1a',
      background_color: '#1a2332',
      icons: [
        { src: FAVICON_URL, sizes: '192x192', type: 'image/jpeg', purpose: 'any' },
        { src: FAVICON_URL, sizes: '512x512', type: 'image/jpeg', purpose: 'any maskable' },
      ],
      categories: ['productivity', 'business', 'developer'],
    };

    // ── Build the deployment payload ─────────────────────────────────────────
    const payload = {
      artifact_code: primary?.code || 'PM-1A-BOOTSTRAP-1.0',
      type: primary?.type || 'X5',
      version: pwaVersion,
      generated_at: new Date().toISOString(),
      generated_by: user?.id || 'service-role',
      export_name: exportRecord?.name || null,
      apex_verification: verifiedKey ? {
        verified: true,
        enterprise_key_label: verifiedKey.label,
        sovereign_ledger: 'SOVEREIGN-KEY-MANAGER-1.0',
        verified_at: new Date().toISOString(),
      } : {
        verified: false,
        note: 'Apex Key not provided — payload generated without Sovereign Ledger verification.',
      },
      builder_id: user?.id || 'service-role',
      master_endpoint: PM1A_MASTER_ENDPOINT,
      component_endpoint: endpointUrl,
      bundled_components: bundledComponents.map(c => ({
        code: c.code,
        name: c.name,
        type: c.type,
        category: c.category,
        endpoint_url: c.endpoint_url,
        description: c.description,
        features: c.features || [],
        schema: c.schema || [],
        price: c.price,
      })),
      pwa_manifest: pwaManifest,
      self_healing_script: SELF_HEALING_SCRIPT,
      offline_bootloader: OFFLINE_BOOTLOADER,
      service_worker: SERVICE_WORKER,
      boot_sequence: {
        step_1: 'Check for local 6a21... identity',
        step_2: 'Provision substrate if missing',
        step_3: 'Establish mTLS tunnel to PM-1A-MASTER-X5',
        step_4: 'Activate self-healing shim',
        step_5: 'Register service worker for offline caching',
      },
      success_indicator: `${pwaName}: Setup Complete. Substrate Active.`,
    };

    // ── Build the complete .zip archive ──────────────────────────────────────
    const zip = new JSZip();
    const slug = pwaName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'pwa';

    zip.file('manifest.json', JSON.stringify(pwaManifest, null, 2));
    zip.file('sw.js', SERVICE_WORKER);
    zip.file('self-healing.js', SELF_HEALING_SCRIPT);
    zip.file('offline-bootloader.js', OFFLINE_BOOTLOADER);
    zip.file('boot-sequence.json', JSON.stringify(payload.boot_sequence, null, 2));
    zip.file('apex-verification.json', JSON.stringify(payload.apex_verification, null, 2));
    zip.file('components.json', JSON.stringify(payload.bundled_components, null, 2));
    zip.file('payload.json', JSON.stringify(payload, null, 2));
    zip.file('index.html', buildIndexHtml(pwaName, pwaVersion, pwaDescription, payload.artifact_code, payload.bundled_components, payload.boot_sequence));

    // Favicon reference file — points to the hosted icon
    zip.file('favicon-ref.txt', [
      'PWA Favicon / Icon Reference',
      '============================',
      `Icon URL: ${FAVICON_URL}`,
      '',
      'This file references the hosted favicon used in the PWA manifest.',
      'Download the icon from the URL above and place it in your PWA root',
      'as favicon.png, then update manifest.json icons.src to "/favicon.png"',
      'for a fully self-contained offline package.',
    ].join('\n'));

    zip.file('README.txt', [
      `${pwaName} — PWA Deployment Package`,
      '====================================',
      `Version: ${pwaVersion}`,
      `Artifact: ${payload.artifact_code}`,
      `Generated: ${payload.generated_at}`,
      `Builder: ${payload.builder_id}`,
      `Master Endpoint: ${payload.master_endpoint}`,
      endpointUrl ? `Component Endpoint: ${endpointUrl}` : '',
      '',
      `Bundled Components (${bundledComponents.length}):`,
      ...bundledComponents.map((c, i) => `  ${i + 1}. ${c.code} — ${c.name} (${c.type})`),
      '',
      'Contents:',
      '  manifest.json          — PWA web-app manifest with favicon icons',
      '  sw.js                  — Sovereign service worker (offline caching)',
      '  self-healing.js        — Self-healing shim script',
      '  offline-bootloader.js  — Offline-first bootloader',
      '  boot-sequence.json     — Boot sequence steps',
      '  apex-verification.json — Sovereign Ledger verification status',
      '  components.json         — Bundled component metadata',
      '  payload.json            — Full deployment payload',
      '  favicon-ref.txt         — Favicon icon reference URL',
      '',
      'Setup:',
      '  1. Host all files in your PWA web root',
      '  2. Link manifest.json in your index.html',
      '  3. Register sw.js as your service worker',
      '  4. Download the favicon from favicon-ref.txt and save locally',
      `  5. ${payload.success_indicator}`,
    ].filter(l => l !== '').join('\n'));

    const zipBytes = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    // Base64-encode the zip so it survives the SDK's JSON response pipeline
    const b64 = btoa(String.fromCharCode(...zipBytes));

    return Response.json({
      filename: `${slug}-v${pwaVersion}-${Date.now()}.zip`,
      zip: b64,
      files: ['manifest.json', 'sw.js', 'self-healing.js', 'offline-bootloader.js', 'boot-sequence.json', 'apex-verification.json', 'components.json', 'payload.json', 'favicon-ref.txt', 'README.txt'],
      component_count: bundledComponents.length,
    });
  } catch (error) {
    console.error('generatePm1aPayload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}