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

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const apexKey = body?.apex_key;
    const exportId = body?.export_id;

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
      generated_by: user.id,
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
      builder_id: user.id,
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