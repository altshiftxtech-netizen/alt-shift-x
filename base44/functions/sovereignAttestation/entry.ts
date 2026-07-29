import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { attestRequest, logBeacon } from '../../shared/sovereignAttestation.ts';

// Sovereign Defense Suite — Tier 1/2 Gateway Attestation.
// Performs app-layer attestation on every incoming request, applies tarpitting
// (Adaptive PoW Gate) and Shadow Reality decoy data for failed attestations,
// and logs every attempt to the Forensic_Beacon ledger.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const verdict = await attestRequest(base44, req);

    // Tarpitting: if attestation failed, delay the response to slow the actor.
    if (!verdict.passed && verdict.tarpitMs > 0) {
      await new Promise((r) => setTimeout(r, verdict.tarpitMs));
    }

    // Log every attestation attempt to the Forensic_Beacon ledger.
    await logBeacon(base44,
      verdict.passed ? "attestation_pass" : "attestation_failure",
      user.id,
      {
        client_ip: verdict.clientIp,
        origin: verdict.origin,
        user_agent: verdict.userAgent,
        policy_code: verdict.policy?.policy_code || "none",
        tarpit_ms: verdict.tarpitMs,
        shadow_reality: verdict.shadowReality,
      }
    );

    // Shadow Reality: return decoy data for failed attestations.
    if (!verdict.passed && verdict.shadowReality) {
      return Response.json({
        attested: false,
        shadow: true,
        data: { access_token: "SHADOW-" + crypto.randomUUID(), expires_in: 3600 },
      });
    }

    if (!verdict.passed) {
      return Response.json({ attested: false, error: "Access policy attestation failed" }, { status: 403 });
    }

    return Response.json({ attested: true, state: verdict.state.protocol_version });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}