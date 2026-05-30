/**
 * snapshotComponentVersion — creates a versioned snapshot of a component at publish time.
 * Called by publishComponent or manually triggered by builders.
 * Payload: { component_id, changelog, breaking_change }
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

function bumpVersion(current) {
  if (!current) return "1.0.0";
  const parts = current.replace(/^v/, "").split(".").map(Number);
  parts[2] = (parts[2] || 0) + 1;
  if (parts[2] >= 10) { parts[1]++; parts[2] = 0; }
  if (parts[1] >= 10) { parts[0]++; parts[1] = 0; }
  return parts.join(".");
}

function diffSnapshots(prev, curr) {
  if (!prev) return { added: Object.keys(curr || {}), modified: [], removed: [] };
  const added = [], modified = [], removed = [];
  for (const k of Object.keys(curr || {})) {
    if (!(k in prev)) added.push(k);
    else if (JSON.stringify(prev[k]) !== JSON.stringify(curr[k])) modified.push(k);
  }
  for (const k of Object.keys(prev)) {
    if (!(k in curr)) removed.push(k);
  }
  return { added, modified, removed };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { component_id, changelog, breaking_change = false } = await req.json();
    if (!component_id) return Response.json({ error: "component_id required" }, { status: 400 });

    // Load the component
    const components = await base44.asServiceRole.entities.Component.filter({ id: component_id });
    if (!components.length) return Response.json({ error: "Component not found" }, { status: 404 });
    const component = components[0];

    // Load previous versions to determine new version number
    const prevVersions = await base44.asServiceRole.entities.ComponentVersion.filter(
      { component_id },
      "-created_date",
      1
    );
    const lastVersion = prevVersions[0]?.version || null;
    const newVersion = breaking_change
      ? (() => { const p = (lastVersion || "0.0.0").split(".").map(Number); p[0]++; p[1] = 0; p[2] = 0; return p.join("."); })()
      : bumpVersion(lastVersion);

    const snapshot = { ...component };
    const diff = diffSnapshots(prevVersions[0]?.snapshot || null, snapshot);

    const version = await base44.asServiceRole.entities.ComponentVersion.create({
      component_id,
      component_name: component.name,
      version: newVersion,
      builder_id: user.id,
      changelog: changelog || `Version ${newVersion} release`,
      snapshot,
      diff_summary: diff,
      status: "published",
      trust_score_at_publish: component.trust_score || 0,
      breaking_change,
      auto_upgrade_eligible: !breaking_change,
      published_at: new Date().toISOString(),
    });

    console.log(`Snapshot created: ${component.name} v${newVersion}`);

    // Fire webhook event (best-effort, non-blocking)
    base44.functions.invoke("dispatchWebhook", {
      event_type: "component.version.released",
      payload: {
        component_id,
        component_name: component.name,
        version: newVersion,
        breaking_change,
        changelog,
        diff_summary: diff,
      },
    }).catch(err => console.warn("Webhook dispatch skipped:", err.message));

    return Response.json({ version: newVersion, snapshot_id: version.id, diff });
  } catch (error) {
    console.error("snapshotComponentVersion error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});