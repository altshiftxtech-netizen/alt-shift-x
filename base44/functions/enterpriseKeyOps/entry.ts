import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// SOVEREIGN-KEY-MANAGER-1.0 — Key-to-Key Orchestrator backend.
// Creates department/client enterprise keys, applies Fix-Only patch shims, and
// installs marketplace components directly onto a key. Every mutating event is
// written to the AuditTrail so the primary Enterprise Admin and the advisory
// agents (BOB / The Upkeeper) have full visibility.

const genKey = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let k = "";
  for (let i = 0; i < 40; i++) k += chars.charAt(Math.floor(Math.random() * chars.length));
  return k;
};

const hash = async (v) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

async function audit(base44, user, action, entityId, summary, risk) {
  try {
    await base44.asServiceRole.entities.AuditTrail.create({
      action,
      entity_type: "api_key",
      entity_id: entityId,
      performed_by: user.id,
      user_email: user.email,
      user_role: user.role,
      change_summary: summary,
      risk_level: risk || "medium",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error("audit write failed:", e.message);
  }
}

// Seat entitlement: admins always pass; otherwise the user must hold an
// enterprise (Sovereign) subscription — the SOVEREIGN-DEV-SEAT-1.0 gate.
async function hasSeat(base44, user) {
  if (user.role === "admin") return true;
  const subs = await base44.entities.Subscription.filter({ user_id: user.id });
  const sub = subs[0];
  return !!(sub && sub.plan === "enterprise" && ["active", "trialing", "past_due"].includes(sub.status));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    if (!(await hasSeat(base44, user))) {
      return Response.json({ error: "A SOVEREIGN-DEV-SEAT-1.0 license is required to manage enterprise keys." }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // ── Create a new department/client-scoped enterprise key ──────────────────
    if (action === "create") {
      const { label, scope } = body;
      if (!label) return Response.json({ error: "label is required" }, { status: 400 });

      const plain = genKey();
      const prefix = `ENT-${label.replace(/[^A-Za-z0-9]+/g, "").slice(0, 6).toUpperCase() || "KEY"}-`;
      const rec = await base44.entities.EnterpriseKey.create({
        owner_id: user.id,
        owner_email: user.email,
        label,
        scope: scope === "client" ? "client" : "department",
        key_prefix: prefix,
        key_last4: plain.slice(-4),
        key_hash: await hash(prefix + plain),
        status: "active",
        installed_components: [],
        patches: [],
      });

      await audit(base44, user, "create", rec.id, `Enterprise key created: ${label} (${scope || "department"})`, "high");
      return Response.json({
        key: prefix + plain,
        keyId: rec.id,
        label,
        message: "Store this enterprise key securely — you won't be able to see it again.",
      }, { status: 201 });
    }

    // ── Patch a Fix-Only component onto an existing key (shim, no redeploy) ────
    if (action === "patch") {
      const { keyId, component_id, component_code, component_name, note } = body;
      if (!keyId || !component_id) return Response.json({ error: "keyId and component_id are required" }, { status: 400 });

      const keys = await base44.entities.EnterpriseKey.filter({ id: keyId });
      const key = keys[0];
      if (!key) return Response.json({ error: "Key not found" }, { status: 404 });

      const patches = [...(key.patches || []), {
        component_id, component_code: component_code || "", component_name: component_name || "",
        note: note || "", patched_at: new Date().toISOString(),
      }];
      await base44.entities.EnterpriseKey.update(keyId, { patches });
      await audit(base44, user, "update", keyId, `Fix-Only patch shimmed onto ${key.label}: ${component_name || component_code || component_id}`, "medium");
      return Response.json({ ok: true, patches });
    }

    // ── Install a marketplace component directly onto an enterprise key ───────
    if (action === "install") {
      const { keyId, component_id, component_code, component_name } = body;
      if (!keyId || !component_id) return Response.json({ error: "keyId and component_id are required" }, { status: 400 });

      const keys = await base44.entities.EnterpriseKey.filter({ id: keyId });
      const key = keys[0];
      if (!key) return Response.json({ error: "Key not found" }, { status: 404 });

      const already = (key.installed_components || []).some((c) => c.component_id === component_id);
      if (already) return Response.json({ ok: true, installed_components: key.installed_components, note: "Already installed on this key." });

      const installed = [...(key.installed_components || []), {
        component_id, component_code: component_code || "", component_name: component_name || "",
        installed_at: new Date().toISOString(),
      }];
      await base44.entities.EnterpriseKey.update(keyId, { installed_components: installed });
      await audit(base44, user, "update", keyId, `Component installed to enterprise key ${key.label}: ${component_name || component_code || component_id}`, "medium");
      return Response.json({ ok: true, installed_components: installed });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("enterpriseKeyOps error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});