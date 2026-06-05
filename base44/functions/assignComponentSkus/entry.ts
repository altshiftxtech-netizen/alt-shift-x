import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// One-time / idempotent maintenance:
//  1. Grants the requesting admin/builder-owner admin role if requested (handled separately).
//  2. Assigns sequential SKUs (ASX-00001, ASX-00002, ...) to every Component that
//     doesn't already have one, ordered by creation date so numbering is stable.
// Admin only.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin only' }, { status: 403 });
    }

    const PREFIX = 'ASX-';
    const pad = (n) => String(n).padStart(5, '0');

    // Pull all components, oldest first, so SKU order is deterministic.
    const all = await base44.asServiceRole.entities.Component.list('created_date', 1000);

    // Find the current highest SKU number already assigned.
    let maxNum = 0;
    for (const c of all) {
      if (c.sku && c.sku.startsWith(PREFIX)) {
        const n = parseInt(c.sku.slice(PREFIX.length), 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
    }

    let assigned = 0;
    const updates = [];
    for (const c of all) {
      if (!c.sku) {
        maxNum += 1;
        const sku = PREFIX + pad(maxNum);
        await base44.asServiceRole.entities.Component.update(c.id, { sku });
        updates.push({ id: c.id, name: c.name, sku });
        assigned += 1;
      }
    }

    return Response.json({
      success: true,
      total: all.length,
      assigned,
      highest_sku: PREFIX + pad(maxNum),
      updates,
    });
  } catch (error) {
    console.error('assignComponentSkus error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});