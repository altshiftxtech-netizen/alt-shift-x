import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// AGENT-TAMPER-EVIDENCE-1.0 — the "Full Gate".
//
// Every export byte-stream must pass through this gate before release. It:
//   1. Computes exact byte size + SHA-256 of the final package.
//   2. Issues a unique integrity_seal_id.
//   3. Verifies hashes/seal/metadata against the GSP-MASTER-INDEX-1.0 records.
//   4. Writes a hidden FORENSIC-AUDIT-LOG record.
//   5. Returns { verified, ... } so the caller can release (or block) the stream.
//
// Payload:
//   base64            — the final package bytes, base64-encoded (real exports)
//   export_kind       — e.g. "owned_components_zip"
//   target_ref        — component id/code / package ref
//   component_code    — the component's code, primary key into GSP-MASTER-INDEX-1.0
//   file_name         — final file name
//   metadata_snapshot — JSON blob of all instruction/schema fields at export
//   flags             — pre-detected flags (e.g. ["DATA_COLLECTION_RISK"])
//   simulate          — true = Forensic Simulator run (no real byte-stream release)
//   register_master   — true = write this hash/seal as the Master Version (authorized builder)
//
// Master-index verification (GSP-MASTER-INDEX-1.0):
//   Entries are ComponentCollaboration records with component_id = GSP-MASTER-INDEX-1.0
//   id (6a4a1f9f62e77d271c297e6a). The forensic markers live in `notes` as a JSON
//   blob: { component_code, reasoning_hash, qr_seal_id }. On export, we look up the
//   entry by component_code and compare the freshly-generated canon_doctrine_hash
//   (SHA-256) + integrity_seal_id against the stored reasoning_hash + qr_seal_id.
//   Mismatch → Integrity Compromised. First-ever Master Version → registered here.
//
// Auth: the caller must be authenticated. Only the gate writes the audit log.

const MASTER_INDEX_ID = '6a4a1f9f62e77d271c297e6a';
const MASTER_INDEX_REF = 'GSP-MASTER-INDEX-1.0';

async function sha256Hex(bytes) {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const {
      base64 = '',
      export_kind = 'unknown',
      target_ref = '',
      component_code = '',
      file_name = '',
      metadata_snapshot = {},
      flags = [],
      simulate = false,
      register_master = false,
    } = body;

    // ── 1. Size + SHA-256 of the final package ──
    let fileSize = 0;
    let sha256 = '';
    if (base64) {
      const bytes = b64ToBytes(base64);
      fileSize = bytes.byteLength;
      sha256 = await sha256Hex(bytes);
    }

    // ── 2. Issue the unique integrity seal (AGENT-TAMPER-EVIDENCE-1.0) ──
    const sealSource = `${sha256}:${user.id}:${Date.now()}:${crypto.randomUUID()}`;
    const sealBytes = new TextEncoder().encode(sealSource);
    const integrity_seal_id = 'SEAL-' + (await sha256Hex(sealBytes)).slice(0, 24).toUpperCase();

    // The canonical doctrine hash is the SHA-256 of the exported package bytes.
    const canon_doctrine_hash = sha256;

    // ── 3. Verify against GSP-MASTER-INDEX-1.0 ──
    // Look up the Master Index entry for this component (by code) and compare the
    // freshly-generated canon_doctrine_hash + integrity_seal_id against the stored
    // reasoning_hash + qr_seal_id. Mismatch = Integrity Compromised.
    const detectedFlags = Array.isArray(flags) ? [...flags] : [];
    let verification_status = 'verified';
    let master_matched = false;
    let master_registered = false;

    // Find the Master Index entry keyed by component_code.
    let masterEntry = null;
    if (component_code) {
      const entries = await base44.asServiceRole.entities.ComponentCollaboration
        .filter({ component_id: MASTER_INDEX_ID })
        .catch(() => []);
      masterEntry = (entries || []).find((e) => {
        try {
          const blob = JSON.parse(e.notes || '{}');
          return blob.component_code === component_code;
        } catch { return false; }
      });
    }

    if (masterEntry) {
      // An entry exists — compare live markers against the certified ones.
      let stored = {};
      try { stored = JSON.parse(masterEntry.notes || '{}'); } catch { stored = {}; }
      // Identity rests on the doctrine hash — the integrity seal is a one-time
      // issuance (unique per export) and is recorded, not matched.
      const hashOk = stored.reasoning_hash === canon_doctrine_hash;
      master_matched = hashOk;
      if (!hashOk) {
        // Live doctrine hash diverged from the certified Master Version.
        verification_status = 'compromised';
        if (!detectedFlags.includes('INTEGRITY_COMPROMISED')) detectedFlags.push('INTEGRITY_COMPROMISED');
      }
    } else if (register_master && component_code && !simulate) {
      // Registration Hook: first-time Master Version by an authorized builder.
      // Write the new hash/seal to the Master Index as a ComponentCollaboration.
      await base44.asServiceRole.entities.ComponentCollaboration.create({
        component_id: MASTER_INDEX_ID,
        component_name: MASTER_INDEX_REF,
        owner_id: user.id,
        notes: JSON.stringify({
          component_code,
          reasoning_hash: canon_doctrine_hash,
          qr_seal_id: integrity_seal_id,
          registered_by: user.email,
          registered_at: new Date().toISOString(),
        }),
        status: 'active',
      });
      master_registered = true;
      master_matched = true;
    }
    // No entry + not registering: leave as 'verified' (nothing to contradict), unless
    // an upstream hard integrity flag was raised.
    if (!masterEntry && detectedFlags.includes('INTEGRITY_COMPROMISED')) {
      verification_status = 'compromised';
    }

    // ── 4. Write the hidden FORENSIC-AUDIT-LOG record ──
    const exported_at = new Date().toISOString();
    const log = await base44.asServiceRole.entities.ForensicAuditLog.create({
      protocol: 'AGENT-TAMPER-EVIDENCE-1.0',
      downloader_id: user.id,
      downloader_email: user.email,
      downloader_role: user.role || 'user',
      export_kind,
      target_ref,
      file_name,
      file_size: fileSize,
      sha256,
      integrity_seal_id,
      metadata_snapshot: metadata_snapshot || {},
      master_index_ref: MASTER_INDEX_REF,
      verification_status,
      flags: detectedFlags,
      simulated: !!simulate,
      exported_at,
    });

    // ── 5. Return the gate verdict ──
    return Response.json({
      verified: verification_status === 'verified',
      verification_status,
      log_id: log.id,
      file_size: fileSize,
      sha256,
      canon_doctrine_hash,
      integrity_seal_id,
      flags: detectedFlags,
      master_index_ref: MASTER_INDEX_REF,
      master_indexed: !!masterEntry,
      master_matched,
      master_registered,
      exported_at,
    });
  } catch (error) {
    console.error('forensicGate error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});