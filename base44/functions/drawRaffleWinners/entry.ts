import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Standard year/month/day age computation as-of a given date.
function computeAge(dobStr, asOfStr) {
  const dob = new Date(dobStr);
  const asOf = new Date(asOfStr);
  if (isNaN(dob.getTime()) || isNaN(asOf.getTime())) return null;
  let age = asOf.getFullYear() - dob.getFullYear();
  const m = asOf.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && asOf.getDate() < dob.getDate())) age--;
  return age;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { raffle_id } = await req.json();
    if (!raffle_id) return Response.json({ error: 'raffle_id required' }, { status: 400 });

    const raffle = await base44.asServiceRole.entities.Raffle.get(raffle_id);
    if (!raffle) return Response.json({ error: 'Raffle not found' }, { status: 404 });

    const policy = raffle.age_policy_id
      ? await base44.asServiceRole.entities.AgePolicy.get(raffle.age_policy_id).catch(() => null)
      : null;
    const minAge = policy?.min_age ?? 16;
    const asOf = raffle.end_date || new Date().toISOString().slice(0, 10);

    // Eligible entries only, one per user (keep the earliest).
    const entries = await base44.asServiceRole.entities.RaffleEntry.filter({ raffle_id, eligible: true }, 'created_date', 5000);
    const seen = new Set();
    const pool = [];
    for (const e of entries) {
      if (e.user_id && seen.has(e.user_id)) continue;
      if (e.user_id) seen.add(e.user_id);
      pool.push(e);
    }

    const numWinners = raffle.num_winners || 1;
    const numAlternates = raffle.num_alternates || 0;

    // Draw a randomized queue; walk it, re-checking DOB age at draw time.
    const queue = shuffle(pool);
    const winners = [];
    const alternates = [];
    const promotions = [];

    for (const entry of queue) {
      const age = computeAge(entry.dob, asOf);
      const passes = age != null && age >= minAge;

      if (!passes) {
        // Failing the winner-time DOB re-check => disqualified, never promoted.
        await base44.asServiceRole.entities.RaffleEntry.update(entry.id, {
          eligible: false, ineligible_reason: 'age_fail', winner_status: 'entrant',
        });
        continue;
      }

      if (winners.length < numWinners) {
        winners.push(entry);
        await base44.asServiceRole.entities.RaffleEntry.update(entry.id, {
          winner_status: 'pending_verification', is_alternate: false, age_at_as_of: age,
        });
      } else if (alternates.length < numAlternates) {
        const rank = alternates.length + 1;
        alternates.push({ ...entry, alternate_rank: rank });
        await base44.asServiceRole.entities.RaffleEntry.update(entry.id, {
          winner_status: 'pending_verification', is_alternate: true, alternate_rank: rank, age_at_as_of: age,
        });
      }
      if (winners.length >= numWinners && alternates.length >= numAlternates) break;
    }

    await base44.asServiceRole.entities.Raffle.update(raffle_id, { status: 'drawn' });

    return Response.json({
      raffle: raffle.title,
      winners: winners.map((w) => ({ id: w.id, name: w.user_name, email: w.email })),
      alternates: alternates.map((a) => ({ id: a.id, name: a.user_name, email: a.email, rank: a.alternate_rank })),
      promotions,
      eligible_pool: pool.length,
    });
  } catch (error) {
    console.error('drawRaffleWinners error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});