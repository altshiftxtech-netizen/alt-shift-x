import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// logBlackstoneAcceptance — the Mandatory Legal Handoff audit trail.
//
// When a user signs off on the Blackstone terms for a legal-clearance-required
// component (BIO-, VANA-VOICE-, UNZIP-, SOVEREIGN- clusters), this:
//   1. Computes a unique acceptance_hash (SHA-256 of user + component + time + nonce).
//   2. Writes a LegalAcceptance record (the user-facing signature receipt).
//   3. Logs a `blackstone_acceptance` event into the GSP-MASTER-INDEX-1.0 registry
//      (ComponentCollaboration under MASTER_INDEX_ID) carrying the acceptance_hash —
//      the immutable source-of-truth audit trail — BEFORE the component is released.
//
// The frontend must receive { acceptance_hash } back before it unlocks the
// purchase/download/install action.
//
// Payload: { component_code, component_id?, signature_name?, accepted_clauses? }
// Returns: { acceptance_hash, accepted_at }

const MASTER_INDEX_ID = "6a4a1f9f62e77d271c297e6a";
const MASTER_INDEX_REF = "GSP-MASTER-INDEX-1.0";

async function sha256Hex(str) {
  const bytes = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const {
      component_code = "",
      component_id = "",
      signature_name = "",
      accepted_clauses = [],
    } = await req.json().catch(() => ({}));

    if (!component_code) {
      return Response.json({ error: "component_code required" }, { status: 400 });
    }

    const accepted_at = new Date().toISOString();

    // 1. Unique, verifiable acceptance hash.
    const acceptance_hash =
      "BLK-" +
      (await sha256Hex(`${user.id}:${component_code}:${accepted_at}:${crypto.randomUUID()}`))
        .slice(0, 40)
        .toUpperCase();

    // 2. User-facing signature receipt.
    await base44.asServiceRole.entities.LegalAcceptance.create({
      user_id: user.id,
      component_code,
      component_id,
      accepted_clauses: Array.isArray(accepted_clauses) ? accepted_clauses : [],
      signature_name: signature_name || user.full_name || user.email,
      accepted_at,
    }).catch((e) => console.error("[logBlackstoneAcceptance] receipt write failed:", e.message));

    // 3. Immutable master-index audit entry carrying the acceptance_hash.
    await base44.asServiceRole.entities.ComponentCollaboration.create({
      component_id: MASTER_INDEX_ID,
      component_name: MASTER_INDEX_REF,
      owner_id: user.id,
      notes: JSON.stringify({
        event: "blackstone_acceptance",
        component_code,
        component_id,
        acceptance_hash,
        accepted_by: user.email,
        accepted_at,
      }),
      status: "active",
    });

    console.log(`[logBlackstoneAcceptance] ${component_code} accepted by ${user.email} → ${acceptance_hash}`);
    return Response.json({ acceptance_hash, accepted_at });
  } catch (error) {
    console.error("[logBlackstoneAcceptance] error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});