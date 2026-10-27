import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const privateHeaders = { 'Cache-Control': 'no-store' };
const fields = ['open_seconds', 'visible_seconds', 'active_seconds', 'music_seconds'];
async function hash(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}
export default async function(req) {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  try {
    const body = await req.json().catch(() => ({}));
    const client = createClientFromRequest(req);
    // Deliberately public anonymous measurement submission. No user identity or auth is collected.
    if (body.action === 'start') {
      const writeKey = crypto.randomUUID() + crypto.randomUUID();
      const startedAt = new Date().toISOString();
      const visit = await client.asServiceRole.entities.ProvingGroundVisit.create({ write_key_hash: await hash(writeKey), started_at: startedAt, open_seconds: 0, visible_seconds: 0, active_seconds: 0, music_seconds: 0 });
      return Response.json({ id: visit.id, writeKey }, { headers: privateHeaders });
    }
    if (body.action !== 'save' || typeof body.id !== 'string' || typeof body.writeKey !== 'string' || body.writeKey.length !== 72) return Response.json({ error: 'Visit credential required' }, { status: 400 });
    const values = Object.fromEntries(fields.map(field => [field, body[field]]));
    if (fields.some(field => typeof values[field] !== 'number' || !Number.isFinite(values[field]) || values[field] < 0) || values.active_seconds > values.visible_seconds || values.visible_seconds > values.open_seconds || values.music_seconds > values.open_seconds) return Response.json({ error: 'Invalid time measurements' }, { status: 400 });
    const query = { id: body.id, write_key_hash: await hash(body.writeKey) };
    // Only the holder of the server-issued random write credential may update this visit.
    const page = await client.asServiceRole.entities.ProvingGroundVisit.filter(query, { limit: 1 });
    const visit = page.items[0];
    if (!visit) return Response.json({ error: 'Unknown visit' }, { status: 403 });
    const elapsed = (Date.now() - new Date(visit.started_at).getTime()) / 1000;
    if (values.open_seconds > elapsed + 5) return Response.json({ error: 'Measurement exceeds visit lifetime' }, { status: 400 });
    // Atomic maxima make retries and overlapping final saves safe, without double-counting.
    await client.asServiceRole.entities.ProvingGroundVisit.updateMany(query, { $max: values });
    return Response.json({ saved: true }, { headers: privateHeaders });
  } catch (error) {
    console.error('Proving Ground measurement failed:', error.message);
    return Response.json({ error: 'Measurement unavailable' }, { status: 500, headers: privateHeaders });
  }
}