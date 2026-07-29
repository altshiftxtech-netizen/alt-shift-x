import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { logBeacon } from '../../shared/sovereignAttestation.ts';

// Sovereign Defense Suite — Tier 3 Audit Watchdog.
// Scheduled automation: runs every 60 minutes. Verifies the Sovereign_State
// invariants against the golden hash, and logs pass/fail to the Forensic_Beacon
// ledger with a Sovereign-USA Apex timestamp.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Load the active Sovereign_State golden baseline.
    const states = await base44.asServiceRole.entities.Sovereign_State.filter(
      { status: "active" }, "-created_date", 1
    );
    const state = states[0];

    if (!state) {
      await logBeacon(base44, "drift_detected", "Sovereign_State", {
        issue: "No active Sovereign_State record found",
        checked_at: new Date().toISOString(),
      });
      return Response.json({ ok: false, error: "No active Sovereign_State" });
    }

    // Recompute the golden hash from the state invariants.
    const invariantPayload = JSON.stringify({
      mtls_strict: state.mtls_strict,
      ja4_enforcement: state.ja4_enforcement,
      pow_gate_enabled: state.pow_gate_enabled,
      apex_orchestrator_authorized: state.apex_orchestrator_authorized,
      protocol_version: state.protocol_version,
    });
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(invariantPayload));
    const computedHash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");

    const drift = computedHash !== state.golden_hash;

    // Log the integrity check result (pass or fail) to the Evidence Vault.
    await logBeacon(base44,
      drift ? "drift_detected" : "integrity_pass",
      state.id,
      {
        expected_hash: state.golden_hash,
        computed_hash: computedHash,
        drift,
        apex_timestamp: new Date().toISOString(),
      }
    );

    // Update last_verified_at on the state record.
    await base44.asServiceRole.entities.Sovereign_State.update(state.id, {
      last_verified_at: new Date().toISOString(),
    });

    return Response.json({ ok: true, drift, computed_hash: computedHash });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}