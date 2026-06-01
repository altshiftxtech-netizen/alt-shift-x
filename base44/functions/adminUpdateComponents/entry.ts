import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { updates } = body; // array of { id, data }

    if (!updates || !Array.isArray(updates)) {
      return Response.json({ error: 'updates array required' }, { status: 400 });
    }

    const results = [];
    for (const update of updates) {
      const result = await base44.asServiceRole.entities.Component.update(update.id, update.data);
      results.push({ id: update.id, success: true });
    }

    return Response.json({ success: true, updated: results.length, results });
  } catch (error) {
    console.error('adminUpdateComponents error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});