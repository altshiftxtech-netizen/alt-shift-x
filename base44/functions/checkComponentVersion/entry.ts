import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// checkComponentVersion — the Logic Engine's version check.
//
// Resolves the caller's currently-held version of a component against the
// certified latest version recorded in the GSP-MASTER-INDEX-1.0 registry
// (ComponentCollaboration records with component_id = MASTER_INDEX_ID). Each
// registry entry stores a JSON blob in `notes`:
//   { component_code, current_version, reasoning_hash, qr_seal_id, ... }
//
// The caller passes the component_code and the version they currently hold
// (held_version, default "V1.0.0"). We return whether a newer version exists
// so the /unzipped dashboard can prompt "Update to Latest Version" while
// maintaining the builder's one-time (lifetime) access.
//
// Payload: { component_code, held_version? }
// Returns: { latest_version, held_version, update_available, master_indexed }

const MASTER_INDEX_ID = "6a4a1f9f62e77d271c297e6a";

// Parse "V1.2.3" / "1.2.3" → [1,2,3] for numeric comparison.
function parseVersion(v) {
  const parts = String(v || "")
    .replace(/^[vV]/, "")
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  while (parts.length < 3) parts.push(0);
  return parts.slice(0, 3);
}

// Returns true if `a` is strictly newer than `b`.
function isNewer(a, b) {
  const [a1, a2, a3] = parseVersion(a);
  const [b1, b2, b3] = parseVersion(b);
  if (a1 !== b1) return a1 > b1;
  if (a2 !== b2) return a2 > b2;
  return a3 > b3;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { component_code = "", held_version = "V1.0.0" } = await req.json().catch(() => ({}));
    if (!component_code) {
      return Response.json({ error: "component_code required" }, { status: 400 });
    }

    // Look up the Master Index entry for this component by code.
    const entries = await base44.asServiceRole.entities.ComponentCollaboration
      .filter({ component_id: MASTER_INDEX_ID })
      .catch(() => []);

    let latest_version = held_version;
    let master_indexed = false;
    for (const e of entries || []) {
      let blob = {};
      try { blob = JSON.parse(e.notes || "{}"); } catch { blob = {}; }
      if (blob.component_code === component_code) {
        master_indexed = true;
        if (blob.current_version && isNewer(blob.current_version, latest_version)) {
          latest_version = blob.current_version;
        } else if (!blob.current_version && isNewer("V1.0.0", latest_version)) {
          latest_version = "V1.0.0";
        }
      }
    }

    const update_available = isNewer(latest_version, held_version);

    return Response.json({
      component_code,
      held_version,
      latest_version,
      update_available,
      master_indexed,
    });
  } catch (error) {
    console.error("[checkComponentVersion] error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});