import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function computeAge(dobStr, asOfStr) {
  const dob = new Date(dobStr);
  const asOf = new Date(asOfStr);
  if (isNaN(dob.getTime()) || isNaN(asOf.getTime())) return null;
  let age = asOf.getFullYear() - dob.getFullYear();
  const m = asOf.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && asOf.getDate() < dob.getDate())) age--;
  return age;
}

// Promote the next available alternate for a raffle to pending_verification.
async function promoteNextAlternate(base44, raffle_id) {
  const alts = await base44.asServiceRole.entities.RaffleEntry.filter(
    { raffle_id, is_alternate: true, eligible: true }, 'alternate_rank', 50
  );
  const next = alts.find((a) => ['pending_verification', 'entrant'].includes(a.winner_status));
  if (!next) return null;
  await base44.asServiceRole.entities.RaffleEntry.update(next.id, {
    is_alternate: false, winner_status: 'pending_verification',
  });
  return next;
}

// Queue fulfillment / claim for a verified winner based on the raffle's claim flow.
async function fulfillOrClaim(base44, raffle, entry) {
  const mode = raffle.claim_flow_mode || 'either_enabled';
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + (raffle.claim_deadline_days || 7));

  const tasks = [];
  (raffle.prizes || []).forEach((p, idx) => {
    // either_enabled => per-prize flag; claim_required => all; no_claim => none.
    const needsClaim = mode === 'claim_required'
      || (mode === 'either_enabled' && p.claim_required);
    if (needsClaim) {
      tasks.push({
        raffle_id: raffle.id, raffle_title: raffle.title, entry_id: entry.id,
        user_id: entry.user_id, user_name: entry.user_name, email: entry.email,
        prize_name: p.name, prize_id: String(idx), fulfillment_mode: p.fulfillment_mode,
        shipping_address_required: p.fulfillment_mode === 'ship',
        status: 'sent', claim_deadline_datetime: deadline.toISOString(),
      });
    }
  });

  if (tasks.length > 0) {
    await base44.asServiceRole.entities.ClaimTask.bulkCreate(tasks);
    await base44.asServiceRole.entities.RaffleEntry.update(entry.id, { winner_status: 'pending_claim' });
    return { queued: 'claim', tasks: tasks.length };
  }

  // no_claim (or all prizes are claim-free): fulfilled directly.
  await base44.asServiceRole.entities.RaffleEntry.update(entry.id, { winner_status: 'fulfilled' });
  return { queued: 'direct_fulfillment' };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // action: 'verify' | 'fail'
    const { entry_id, action, reason } = await req.json();
    if (!entry_id || !action) return Response.json({ error: 'entry_id and action required' }, { status: 400 });

    const entry = await base44.asServiceRole.entities.RaffleEntry.get(entry_id);
    if (!entry) return Response.json({ error: 'Entry not found' }, { status: 404 });
    const raffle = await base44.asServiceRole.entities.Raffle.get(entry.raffle_id);

    if (action === 'fail') {
      await base44.asServiceRole.entities.RaffleEntry.update(entry_id, {
        eligible: false, ineligible_reason: reason || 'unreachable', winner_status: 'entrant',
      });
      const promoted = raffle?.auto_promote_on_claim_failure === false
        ? null
        : await promoteNextAlternate(base44, entry.raffle_id);
      return Response.json({ result: 'failed', promoted: promoted ? { id: promoted.id, name: promoted.user_name } : null });
    }

    // action === 'verify' — re-check DOB age vs raffle end date before fulfilling.
    const asOf = raffle.end_date || new Date().toISOString().slice(0, 10);
    const policy = raffle.age_policy_id
      ? await base44.asServiceRole.entities.AgePolicy.get(raffle.age_policy_id).catch(() => null) : null;
    const minAge = policy?.min_age ?? 16;
    const age = computeAge(entry.dob, asOf);

    if (age == null || age < minAge) {
      await base44.asServiceRole.entities.RaffleEntry.update(entry_id, {
        eligible: false, ineligible_reason: 'age_fail', winner_status: 'entrant',
      });
      const promoted = await promoteNextAlternate(base44, entry.raffle_id);
      return Response.json({ result: 'age_fail', promoted: promoted ? { id: promoted.id, name: promoted.user_name } : null });
    }

    await base44.asServiceRole.entities.RaffleEntry.update(entry_id, { winner_status: 'verified' });
    const outcome = await fulfillOrClaim(base44, raffle, entry);
    return Response.json({ result: 'verified', ...outcome });
  } catch (error) {
    console.error('processRaffleWinner error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});