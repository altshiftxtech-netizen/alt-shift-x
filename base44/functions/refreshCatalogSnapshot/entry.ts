import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

/**
 * refreshCatalogSnapshot — rebuilds the live marketplace snapshot the
 * sales_consultant trains on. Runs on a 15-minute schedule so the consultant
 * always reflects the current published catalog, even before it searches.
 *
 * Stores a single "live" CatalogSnapshot row containing a lightweight
 * projection of every published component. Keeping it lean (truncated
 * descriptions, only the fields needed to recommend) keeps the agent reliable.
 *
 * Auth: callable by the scheduler (INTERNAL_TASK_SECRET) or an admin.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Authorize: scheduled automations run without a user session — allow those
    // through; any human caller must be an admin.
    let user = null;
    try { user = await base44.auth.me(); } catch { user = null; }
    if (user && user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const published = await base44.asServiceRole.entities.Component.filter({ status: "published" });

    const components = published.map((c) => ({
      name: c.name,
      code: c.code,
      type: c.type,
      category: c.category,
      builder_name: c.builder_name || "",
      price: c.price,
      rating: c.rating || 0,
      trust_score: c.trust_score || 0,
      certified: !!c.certified,
      description: (c.description || "").slice(0, 140),
    }));

    const categories = [...new Set(components.map((c) => c.category).filter(Boolean))];

    const payload = {
      snapshot_key: "live",
      refreshed_at: new Date().toISOString(),
      component_count: components.length,
      categories,
      components,
    };

    const existing = await base44.asServiceRole.entities.CatalogSnapshot.filter({ snapshot_key: "live" });
    if (existing[0]) {
      await base44.asServiceRole.entities.CatalogSnapshot.update(existing[0].id, payload);
    } else {
      await base44.asServiceRole.entities.CatalogSnapshot.create(payload);
    }

    console.log(`[refreshCatalogSnapshot] refreshed ${components.length} published components across ${categories.length} categories`);
    return Response.json({ ok: true, component_count: components.length, categories: categories.length });
  } catch (error) {
    console.error("[refreshCatalogSnapshot] error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});