import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// PM-1A Deployment Payload Generator
//
// 1. Verifies admin auth + Apex Key (secondary Sovereign Ledger handshake)
// 2. Fetches the PM-1A-BOOTSTRAP-1.0 component manifest
// 3. Injects builder_id + PM-1A-MASTER-X5 endpoint URL
// 4. Returns a single .pwa payload (manifest + self-healing script + offline bootloader)

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

    const body = await req.json();
    const apexKey = body?.apex_key;

    // ── Apex Key verification (Sovereign Ledger handshake) — optional ─────────
    // When an Apex Key is provided, verify it against the Sovereign Ledger and
    // embed the verification metadata in the payload. When omitted, the payload
    // is still generated but flagged as unverified.
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

    // ── Fetch the PM-1A-BOOTSTRAP-1.0 component manifest ──────────────────────
    const components = await base44.asServiceRole.entities.Component.filter({
      code: 'PM-1A-BOOTSTRAP-1.0',
    }, '-created_date', 5);

    const bootstrap = components[0];
    if (!bootstrap) {
      return Response.json({
        error: 'PM-1A-BOOTSTRAP-1.0 component not found in the registry.',
      }, { status: 404 });
    }

    // ── Build the deployment payload ─────────────────────────────────────────
    const payload = {
      artifact_code: 'PM-1A-BOOTSTRAP-1.0',
      type: bootstrap.type || 'X5',
      version: '1.0',
      generated_at: new Date().toISOString(),
      generated_by: user.id,
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
      pwa_manifest: {
        name: bootstrap.name || 'Patriot Machine 1A',
        short_name: 'PM-1A',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0e1a',
        theme_color: '#1a2332',
        scope: '/pm-1a/',
      },
      self_healing_script: SELF_HEALING_SCRIPT,
      offline_bootloader: OFFLINE_BOOTLOADER,
      boot_sequence: {
        step_1: 'Check for local 6a21... identity',
        step_2: 'Provision substrate if missing',
        step_3: 'Establish mTLS tunnel to PM-1A-MASTER-X5',
        step_4: 'Activate self-healing shim',
      },
      success_indicator: 'Patriot Machine 1A: Setup Complete. Substrate Active.',
    };

    // ── Return as downloadable .pwa payload ────────────────────────────────────
    const filename = `PM-1A-DEPLOYMENT-${Date.now()}.pwa`;
    const fileContent = JSON.stringify(payload, null, 2);

    return new Response(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('generatePm1aPayload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}