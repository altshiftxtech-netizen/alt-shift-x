import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
export default async function(req) {
  try {
    const client = createClientFromRequest(req);
    const user = await client.auth.me().catch(e => e.status === 401 || e.status === 403 ? null : Promise.reject(e));
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
    const totals = await client.entities.ProvingGroundVisit.aggregate({ sum: ['open_seconds', 'visible_seconds', 'active_seconds', 'music_seconds'], min: ['started_at'], max: ['updated_date'] });
    return Response.json({ totals: totals.rows[0] || {}, refreshed_at: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Proving Ground report failed:', error.message);
    return Response.json({ error: 'Unable to load report' }, { status: 500 });
  }
}