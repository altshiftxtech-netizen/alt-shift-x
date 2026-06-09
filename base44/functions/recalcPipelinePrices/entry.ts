import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Admin-only one-time utility: recalculates each active pipeline's one-time
 * price as the SUM of the prices of all components it includes.
 *
 * Mirrors the Pipelines page resolution logic exactly:
 *  - curated_exclusive  → components matched by component_codes (deduped)
 *  - best_of_pool       → all published components with include_in_pipelines=true
 *  - resident_developer_ready → ALSO add all published components built by any
 *                               Resident Developer (UserAdminProfile.resident_developer)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow two callers: (1) an authenticated admin running it manually, or
    // (2) the entity automation (no user context — it fires on Component changes).
    let body = {};
    try { body = await req.json(); } catch { /* no body */ }
    const isAutomationTrigger = !!body?.event?.entity_name; // automation payload shape

    if (!isAutomationTrigger) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    const [pipelines, allComponents, residentProfiles] = await Promise.all([
      base44.asServiceRole.entities.Pipeline.filter({ active: true }),
      base44.asServiceRole.entities.Component.filter({ status: 'published' }),
      base44.asServiceRole.entities.UserAdminProfile.filter({ resident_developer: true }),
    ]);

    // Index components by code for fast lookup.
    const byCode = {};
    for (const c of allComponents) {
      if (c.code) byCode[c.code] = c;
    }

    const residentIds = new Set((residentProfiles || []).map((p) => p.user_id));
    const residentComponents = allComponents.filter((c) => residentIds.has(c.builder_id));
    const poolComponents = allComponents.filter((c) => c.include_in_pipelines === true);

    const results = [];

    for (const p of pipelines) {
      // Build the unique set of components included in this pipeline.
      const included = new Map(); // id -> component

      if (p.pipeline_type === 'best_of_pool') {
        for (const c of poolComponents) included.set(c.id, c);
      } else {
        // curated_exclusive — resolve each code (dedup handled by the Map).
        for (const code of (p.component_codes || [])) {
          const c = byCode[code];
          if (c) included.set(c.id, c);
        }
      }

      // Resident-developer-ready pipelines expand to include all resident dev components.
      if (p.resident_developer_ready) {
        for (const c of residentComponents) included.set(c.id, c);
      }

      const componentCount = included.size;
      // Component prices are monthly ($/month). These intelligence assets stay
      // relevant ~10 years, so we price the pipeline at a fair 5-YEAR (60-month)
      // subscription value — half the useful life.
      const monthlySum = [...included.values()].reduce((acc, c) => acc + (Number(c.price) || 0), 0);
      const newPrice = Math.round(monthlySum * 60 * 100) / 100;

      await base44.asServiceRole.entities.Pipeline.update(p.id, { price: newPrice });

      results.push({
        id: p.id,
        name: p.name,
        pipeline_type: p.pipeline_type,
        resident_developer_ready: !!p.resident_developer_ready,
        componentCount,
        oldPrice: p.price,
        newPrice,
      });
    }

    return Response.json({ updated: results.length, results });
  } catch (error) {
    console.error('recalcPipelinePrices error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});