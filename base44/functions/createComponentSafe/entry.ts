import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * createComponentSafe — the ONLY sanctioned path for creating marketplace
 * components. Enforces the duplicate guard in CODE (not in agent instructions),
 * so a duplicate `code` can never be inserted regardless of which agent or
 * caller triggers it.
 *
 * For each incoming component: if a Component with the exact same `code` already
 * exists, it is UPDATED in place; otherwise a new one is created. Works for a
 * single component or a batch.
 *
 * Payload:
 *   { component: {...} }              // single
 *   { components: [ {...}, {...} ] }  // batch
 *
 * Each component object must include at least: name, code, type, category,
 * description, price. builder_id defaults to the calling user if omitted.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const incoming = Array.isArray(body.components)
      ? body.components
      : body.component
        ? [body.component]
        : [];

    if (incoming.length === 0) {
      return Response.json({ error: 'Provide `component` or `components`.' }, { status: 400 });
    }

    const sr = base44.asServiceRole;
    const results = [];

    for (const raw of incoming) {
      const c = raw || {};
      // Validate required fields per component (fail-soft — report and continue).
      if (!c.name || !c.code || !c.type || !c.category || !c.description || c.price === undefined) {
        results.push({ code: c.code || '(missing)', action: 'skipped', success: false, error: 'Missing required fields' });
        continue;
      }

      const code = String(c.code).trim();

      // Shared fields written on both create and update.
      const fields = {
        name: c.name,
        type: c.type,
        category: c.category,
        description: c.description,
        long_description: c.long_description || '',
        features: c.features || [],
        schema: c.schema || [],
        price: c.price,
        include_in_pipelines: !!c.include_in_pipelines,
        status: c.status || 'pending_review',
      };
      if (c.book_meta) fields.book_meta = c.book_meta;

      try {
        // DUPLICATE GUARD — is there already a component with this exact code?
        const existing = await sr.entities.Component.filter({ code }).catch(() => []);

        if (existing && existing.length > 0) {
          const updated = await sr.entities.Component.update(existing[0].id, fields);
          results.push({ code, id: existing[0].id, action: 'updated', success: true });
          console.log(`createComponentSafe: code "${code}" existed — updated in place (id=${existing[0].id}).`);
        } else {
          const created = await sr.entities.Component.create({
            builder_id: c.builder_id || user.id,
            code,
            ...fields,
            rating: 0,
            reviews_count: 0,
            installs_count: 0,
            trust_score: 75,
            trust_breakdown: { performance: 75, safety: 75, satisfaction: 75, retention: 75 },
            certified: false,
          });
          results.push({ code, id: created.id, action: 'created', success: true });
          console.log(`createComponentSafe: code "${code}" created new (id=${created.id}).`);
        }
      } catch (e) {
        results.push({ code, action: 'error', success: false, error: e.message });
        console.error(`createComponentSafe error for code "${code}":`, e.message);
      }
    }

    const created = results.filter((r) => r.action === 'created').length;
    const updated = results.filter((r) => r.action === 'updated').length;
    return Response.json({
      success: true,
      created,
      updated,
      total: results.length,
      message: `${created} created, ${updated} updated in place (no duplicates).`,
      results,
    });
  } catch (error) {
    console.error('createComponentSafe error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});