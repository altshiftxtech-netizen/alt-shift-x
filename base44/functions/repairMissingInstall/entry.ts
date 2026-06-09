import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

/**
 * repairMissingInstall — admin-only one-shot repair.
 * Re-creates an InstalledComponent record that a webhook failed to write,
 * given a user_id + component_id. Idempotent: skips if already installed.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { userId, componentId, stripeSubscriptionId } = await req.json();
    if (!userId || !componentId) {
      return Response.json({ error: "userId and componentId are required" }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.InstalledComponent.filter({
      user_id: userId,
      component_id: componentId,
    });
    if (existing.length > 0) {
      return Response.json({ ok: true, message: "Already installed", record: existing[0] });
    }

    const comps = await base44.asServiceRole.entities.Component.filter({ id: componentId });
    if (!comps.length) {
      return Response.json({ error: "Component not found" }, { status: 404 });
    }
    const c = comps[0];

    const record = await base44.asServiceRole.entities.InstalledComponent.create({
      user_id: userId,
      component_id: componentId,
      component_name: c.name || "",
      component_code: c.code || "",
      component_type: c.type || "X1",
      trust_score: c.trust_score || 0,
      stripe_subscription_id: stripeSubscriptionId || "",
      status: "active",
      installed_at: new Date().toISOString().split("T")[0],
    });

    console.log(`[repairMissingInstall] Created install for user=${userId}, component=${c.code}`);
    return Response.json({ ok: true, record });
  } catch (error) {
    console.error("[repairMissingInstall] error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});