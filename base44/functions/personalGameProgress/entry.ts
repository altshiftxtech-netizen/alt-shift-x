import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { personalGameRecord, personalGameStatus } from '../../shared/personalGameReward.ts';

export default async function(req) {
  try {
    const client = createClientFromRequest(req);
    const user = await client.auth.me().catch(e => e.status === 401 ? null : Promise.reject(e));
    if (!user) return Response.json({ error: 'Sign in to save successes and earn your personal discount.' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    if (!['status', 'start', 'finish'].includes(body.action)) return Response.json({ error: 'Invalid game action.' }, { status: 400 });
    const records = client.asServiceRole.entities.PersonalGameProgress;
    let record = await personalGameRecord(client, user.id);
    if (body.action === 'status') return Response.json(personalGameStatus(record));
    if (body.action === 'start') {
      const valid = body.kind === 'tree' ? /^plot-([0-9]|[1-4][0-9])$/.test(body.target) : body.kind === 'rover' && /^rover-[0-9]$/.test(body.target);
      if (!valid) return Response.json({ error: 'Choose a valid game target.' }, { status: 400 });
      if (record?.successes >= 50) return Response.json({ ...personalGameStatus(record), error: 'Your discount is already unlocked.' }, { status: 409 });
      if (body.kind === 'tree' && record?.planted?.includes(body.target)) return Response.json({ error: 'That plot already has a tree.' }, { status: 409 });
      if (body.kind === 'rover' && record?.last_rover === body.target) return Response.json({ error: 'Choose a different rover before scanning this one again.' }, { status: 409 });
      if (!record) record = await records.create({ user_id: user.id, successes: 0, planted: [], challenge: '', last_rover: '' });
      const challenge = crypto.randomUUID();
      await records.update(record.id, { challenge, challenge_kind: body.kind, challenge_target: body.target, challenge_started: Date.now() });
      return Response.json({ ...personalGameStatus(record), challenge, minimum_ms: 2000 });
    }
    if (!record || !body.challenge || record.challenge !== body.challenge) return Response.json({ error: 'This attempt has expired or was already counted.' }, { status: 409 });
    const age = Date.now() - record.challenge_started;
    if (age < 2000 || age > 20000) return Response.json({ error: 'Keep the action active for two seconds, then try again.' }, { status: 409 });
    const changes = { successes: Math.min(50, record.successes + 1), challenge: '' };
    if (record.challenge_kind === 'tree') changes.planted = [...(record.planted || []), record.challenge_target];
    else changes.last_rover = record.challenge_target;
    // Compare-and-swap consumes a challenge once, including simultaneous retries.
    await records.updateMany({ id: record.id, user_id: user.id, challenge: body.challenge, successes: record.successes }, { $set: changes });
    const saved = await records.get(record.id);
    return Response.json(personalGameStatus(saved));
  } catch (error) {
    console.error('[personalGameProgress]', error.message);
    return Response.json({ error: 'Progress could not be saved. Please retry.' }, { status: 500 });
  }
}