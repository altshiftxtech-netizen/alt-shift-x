import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Admin-only one-time utility: recalculates each active pipeline's one-time
 * price as the SUM of the prices of all components it includes.
 *
 * Membership & pricing per pipeline_type:
 *  - curated_exclusive (Exclusive Pool) → components matched by component_codes
 *      (+ all Resident Developer components when resident_developer_ready).
 *      Priced one-time at a fair 5-YEAR value (monthly sum × 60).
 *  - best_of_pool (Best-of Pool) → published components with include_in_pipelines=true.
 *      Priced one-time at a fair 5-YEAR value (monthly sum × 60).
 *  - open_contribution (Open Contribution Pipeline) → published components with
 *      include_in_open_pipeline=true. Sold as a QUARTERLY subscription; each
 *      quarterly charge = sum of contributors' monthly prices × 12.
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
    const openComponents = allComponents.filter((c) => c.include_in_open_pipeline === true);

    const results = [];

    for (const p of pipelines) {
      // Build the unique set of components included in this pipeline.
      const included = new Map(); // id -> component

      if (p.pipeline_type === 'best_of_pool') {
        for (const c of poolComponents) included.set(c.id, c);
      } else if (p.pipeline_type === 'open_contribution') {
        for (const c of openComponents) included.set(c.id, c);
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
      const monthlySum = [...included.values()].reduce((acc, c) => acc + (Number(c.price) || 0), 0);

      let newPrice;
      if (p.pipeline_type === 'open_contribution') {
        // Open Contribution Pipeline — billed QUARTERLY; each quarterly charge is
        // the sum of contributors' monthly prices × 12.
        newPrice = Math.round(monthlySum * 12 * 100) / 100;
      } else {
        // The two pools — one-time, fair 5-YEAR value (monthly sum × 60), since
        // these intelligence assets stay relevant ~10 years (half the useful life).
        newPrice = Math.round(monthlySum * 60 * 100) / 100;
      }

      await base44.asServiceRole.entities.Pipeline.update(p.id, { price: newPrice });

      results.push({
        id: p.id,
        name: p.name,
        pipeline_type: p.pipeline_type,
        billing_cadence: p.billing_cadence,
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