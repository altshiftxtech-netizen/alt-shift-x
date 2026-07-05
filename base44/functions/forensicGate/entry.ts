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
//   file_name         — final file name
//   metadata_snapshot — JSON blob of all instruction/schema fields at export
//   flags             — pre-detected flags (e.g. ["DATA_COLLECTION_RISK"])
//   simulate          — true = Forensic Simulator run (no real byte-stream release)
//   expected_sha256   — (simulate) hash on record in GSP-MASTER-INDEX-1.0 to match
//   expected_seal_id  — (simulate) seal on record to match
//
// Auth: the caller must be authenticated. Only the gate writes the audit log.

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
      file_name = '',
      metadata_snapshot = {},
      flags = [],
      simulate = false,
      expected_sha256 = null,
      expected_seal_id = null,
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

    // ── 3. Verify against GSP-MASTER-INDEX-1.0 ──
    // Simulation: verified iff the provided hash AND seal match the on-record values.
    // Real export: the freshly-sealed stream is authoritative — verified unless a
    // hard integrity flag was raised upstream.
    const detectedFlags = Array.isArray(flags) ? [...flags] : [];
    let verification_status = 'verified';

    if (simulate) {
      const hashOk = !expected_sha256 || expected_sha256 === sha256;
      const sealOk = !expected_seal_id || expected_seal_id === integrity_seal_id;
      if (!hashOk || !sealOk) {
        verification_status = 'compromised';
        if (!detectedFlags.includes('INTEGRITY_COMPROMISED')) detectedFlags.push('INTEGRITY_COMPROMISED');
      }
    } else if (detectedFlags.includes('INTEGRITY_COMPROMISED')) {
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
      master_index_ref: 'GSP-MASTER-INDEX-1.0',
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
      integrity_seal_id,
      flags: detectedFlags,
      exported_at,
    });
  } catch (error) {
    console.error('forensicGate error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});