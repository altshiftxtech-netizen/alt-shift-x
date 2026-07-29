// Sovereign Defense Suite — shared attestation logic.
// Used by sovereignAttestation (the gateway gate) and sovereignWatchdog (the audit sweep).
// Extracted here so both functions share a single source of truth — never copied.

// Verify incoming request metadata against Sovereign_State invariants and
// Access_Policy rules. Returns the attestation verdict plus tarpit/shadow directives.
export async function attestRequest(base44, req) {
  // Load the active Sovereign_State (the golden baseline).
  const states = await base44.asServiceRole.entities.Sovereign_State.filter(
    { status: "active" }, "-created_date", 1
  );
  const state = states[0] || {};

  // Extract request metadata for app-layer attestation.
  const origin = req.headers.get("origin") || "";
  const userAgent = req.headers.get("user-agent") || "";
  const forwardedFor = req.headers.get("x-forwarded-for") || "";
  const clientIp = forwardedFor.split(",")[0].trim() || "unknown";

  // Load all active access policies.
  const policies = await base44.asServiceRole.entities.Access_Policy.filter(
    { is_active: true }
  );

  // Find the first matching policy (by origin or UA pattern).
  let matchedPolicy = null;
  for (const p of policies) {
    const originMatch = (p.allowed_origins || []).some(
      (o) => o && (o === "*" || origin.includes(o))
    );
    const uaMatch = (p.allowed_user_agents || []).some(
      (u) => u && (u === "*" || userAgent.toLowerCase().includes(u.toLowerCase()))
    );
    if (originMatch || uaMatch) { matchedPolicy = p; break; }
  }

  // Fail closed: pass only if a policy matched AND the Sovereign_State is active.
  const passed = !!(matchedPolicy && state.status === "active");
  const tarpitMs = passed ? 0 : (matchedPolicy?.tarpit_duration_ms || 0);
  const shadowReality = passed ? false : !!matchedPolicy?.shadow_reality_enabled;

  return {
    passed,
    state,
    policy: matchedPolicy,
    tarpitMs,
    shadowReality,
    clientIp,
    origin,
    userAgent,
  };
}

// Write a Forensic_Beacon record (canary token / audit artifact).
export async function logBeacon(base44, type, targetRef, meta = {}) {
  const tokenSource = `${type}:${targetRef}:${crypto.randomUUID()}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(tokenSource));
  const tokenHash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");

  return base44.asServiceRole.entities.Forensic_Beacon.create({
    beacon_code: "BEACON-" + tokenHash.slice(0, 16).toUpperCase(),
    beacon_type: type,
    target_ref: targetRef || "",
    token_hash: tokenHash,
    deployed_at: new Date().toISOString(),
    metadata: meta,
  }).catch((e) => { console.error("[sovereignAttestation] beacon log failed:", e.message); });
}