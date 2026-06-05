import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Entity automation handler: when a new Component is created without a SKU,
// assign the next sequential SKU (ASX-#####) and keep the numbering system going.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const entityId = body?.event?.entity_id;
    if (!entityId) return Response.json({ skipped: 'no entity id' });

    const PREFIX = 'ASX-';
    const pad = (n) => String(n).padStart(5, '0');

    const comp = await base44.asServiceRole.entities.Component.get(entityId).catch(() => null);
    if (!comp) return Response.json({ skipped: 'component not found' });
    if (comp.sku) return Response.json({ skipped: 'already has sku', sku: comp.sku });

    // Find current highest SKU number across all components.
    const all = await base44.asServiceRole.entities.Component.list('created_date', 1000);
    let maxNum = 0;
    for (const c of all) {
      if (c.sku && c.sku.startsWith(PREFIX)) {
        const n = parseInt(c.sku.slice(PREFIX.length), 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
    }
    const sku = PREFIX + pad(maxNum + 1);
    await base44.asServiceRole.entities.Component.update(entityId, { sku });

    return Response.json({ success: true, id: entityId, sku });
  } catch (error) {
    console.error('autoAssignSku error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});