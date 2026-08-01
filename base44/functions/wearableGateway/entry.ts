import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { generateRandomKey, hashKey, makeRateLimiter } from "../../shared/apiKeyCrypto.ts";

// SOV-WEARABLE-VOICE-1.0 — secure API-key gateway for smartwatches & voice
// assistants. issue (authed) mints a scoped gateway key; probe (key-only, via
// x-api-key) returns a glanceable substrate status readout for watch faces /
// voice skills; revoke (authed) deactivates a key.

// Rate limit: max 8 gateway ops per IP per minute.
const rlCheck = makeRateLimiter(8, 60_000);

export default async function(req) {
  try {
    if (!rlCheck(req)) {
      return Response.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action || "issue";

    if (action === "issue") {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const plainKey = "ASX-WG-" + generateRandomKey();
      const keyHash = await hashKey(plainKey);
      await base44.entities.ApiKey.create({
        user_id: user.id,
        name: "Wearable & Voice Gateway",
        description: "SOV-WEARABLE-VOICE-1.0 · scope: wearable_voice · glanceable substrate access for smartwatches & voice assistants",
        key_hash: keyHash,
        status: "active",
      });
      console.log(`Wearable gateway key issued: user=${user.id}`);
      return Response.json({
        key: plainKey,
        masked: `${plainKey.slice(0, 10)}…${plainKey.slice(-4)}`,
        endpoint: "/functions/wearableGateway",
        message: "Store this gateway key securely — it authenticates your smartwatch & voice-assistant requests.",
      }, { status: 201 });
    }

    if (action === "probe") {
      const key = body.key || req.headers.get("x-api-key");
      if (!key) return Response.json({ error: "Missing gateway key" }, { status: 401 });
      const hash = await hashKey(key);
      const keys = await base44.asServiceRole.entities.ApiKey.filter({ key_hash: hash }, "", 1);
      if (!keys.length || keys[0].status !== "active") {
        return Response.json({ error: "Invalid gateway key" }, { status: 401 });
      }
      const owner = keys[0];
      // Best-effort last-used stamp.
      try {
        await base44.asServiceRole.entities.ApiKey.update(owner.id, { last_used: new Date().toISOString() });
      } catch (e) { /* non-critical */ }
      return Response.json({
        status: "sealed",
        gateway: "SOV-WEARABLE-VOICE-1.0",
        owner_name: owner.name,
        message: "Substrate sealed. Gateway active.",
        modules: ["BOBby", "Claire 1.0", "B.O.B.Init"],
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "revoke") {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const key = body.key;
      if (!key) return Response.json({ error: "Missing key" }, { status: 400 });
      const hash = await hashKey(key);
      const keys = await base44.entities.ApiKey.filter({ key_hash: hash, user_id: user.id }, "", 1);
      if (!keys.length) return Response.json({ error: "Key not found" }, { status: 404 });
      await base44.entities.ApiKey.update(keys[0].id, { status: "revoked" });
      return Response.json({ revoked: true });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("wearableGateway error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}