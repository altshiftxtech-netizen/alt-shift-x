import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Strict admin-only: this function uses service role to mutate the entire catalog.
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { updates } = body; // array of { id, data }

    if (!updates || !Array.isArray(updates)) {
      return Response.json({ error: 'updates array required' }, { status: 400 });
    }

    const results = [];
    for (const update of updates) {
      if (update.id === 'CREATE') {
        const created = await base44.asServiceRole.entities.Component.create(update.data);
        results.push({ id: created.id, action: 'created', success: true });
      } else {
        await base44.asServiceRole.entities.Component.update(update.id, update.data);
        results.push({ id: update.id, action: 'updated', success: true });
      }
    }

    return Response.json({ success: true, count: results.length, results });
  } catch (error) {
    console.error('adminUpdateComponents error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});