import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only diagnostic: returns a compact, accurate snapshot of the published
// Component catalog — exactly the data the sales_consultant agent reads when it
// recommends. Used to verify catalog accuracy / data hygiene.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const all = await base44.asServiceRole.entities.Component.list('-created_date', 1000);
    const published = all.filter((c) => c.status === 'published');

    // Per-component compact view
    const components = published.map((c) => ({
      code: c.code,
      name: c.name,
      sku: c.sku,
      type: c.type,
      category: c.category,
      price: c.price,
      trust_score: c.trust_score,
      certified: c.certified,
      builder: c.builder_name,
      // Data-quality flags
      issues: [
        !c.description && 'missing description',
        !c.category && 'missing category',
        (c.price === undefined || c.price === null) && 'missing price',
        (!c.features || c.features.length === 0) && 'no features listed',
      ].filter(Boolean),
    }));

    // Aggregate breakdowns the agent relies on for matching
    const byType = {};
    const byCategory = {};
    let priceMin = Infinity, priceMax = -Infinity, priceSum = 0;
    for (const c of published) {
      byType[c.type] = (byType[c.type] || 0) + 1;
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      if (typeof c.price === 'number') {
        priceMin = Math.min(priceMin, c.price);
        priceMax = Math.max(priceMax, c.price);
        priceSum += c.price;
      }
    }

    const withIssues = components.filter((c) => c.issues.length > 0);

    return Response.json({
      total_published: published.length,
      total_all_statuses: all.length,
      by_type: byType,
      by_category: byCategory,
      price_range: {
        min: priceMin === Infinity ? null : priceMin,
        max: priceMax === -Infinity ? null : priceMax,
        avg: published.length ? Math.round((priceSum / published.length) * 100) / 100 : null,
      },
      data_quality: {
        clean_count: components.length - withIssues.length,
        issue_count: withIssues.length,
        components_with_issues: withIssues,
      },
      catalog: components,
    });
  } catch (error) {
    console.error('auditComponentCatalog error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});