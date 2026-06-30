import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Awards wholesome participation points for Speakeasy Social actions.
 *
 * Design goals (from the spec): reward genuine, generous participation —
 * NOT addictive engagement-farming. So:
 *  - "post"        → a real post (small daily-capped reward)
 *  - "reply"       → only counts as a thoughtful reply when it has real substance
 *                    (length gate) — low-effort one-word spam earns nothing.
 *  - "appreciate"  → giving a reaction to SOMEONE ELSE rewards generosity.
 *
 * Levels are recognition tiers, deliberately gentle — no streaks, no FOMO.
 */
const ACTION_POINTS = { post: 5, reply: 3, appreciate: 1 };
const DAILY_CAP = 60; // gentle ceiling so nobody can grind the feed all day

function levelFor(points) {
  if (points >= 1000) return "Luminary";
  if (points >= 400) return "Pillar";
  if (points >= 150) return "Contributor";
  if (points >= 40) return "Regular";
  return "Newcomer";
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { action, text } = await req.json();
    if (!ACTION_POINTS[action]) {
      return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    // A reply only earns points when it carries substance (>= 15 chars after trim).
    if (action === "reply" && (!text || text.trim().length < 15)) {
      return Response.json({ awarded: 0, reason: "reply_too_short" });
    }

    const svc = base44.asServiceRole;
    const existing = await svc.entities.ParticipationScore.filter({ user_id: user.id });
    let record = existing[0];

    if (!record) {
      record = await svc.entities.ParticipationScore.create({
        user_id: user.id,
        user_name: user.full_name || user.email,
        points: 0,
        level: "Newcomer",
        posts_count: 0,
        thoughtful_replies_count: 0,
        appreciations_given: 0,
      });
    }

    // Daily cap: count points already awarded today.
    const today = new Date().toISOString().slice(0, 10);
    const lastDay = (record.last_awarded_at || "").slice(0, 10);
    const dailyKey = `_daily_${today}`;
    let dailyEarned = lastDay === today ? (record[dailyKey] || 0) : 0;

    const reward = ACTION_POINTS[action];
    if (dailyEarned >= DAILY_CAP) {
      return Response.json({ awarded: 0, reason: "daily_cap", points: record.points, level: record.level });
    }

    const newPoints = (record.points || 0) + reward;
    const update = {
      points: newPoints,
      level: levelFor(newPoints),
      last_awarded_at: new Date().toISOString(),
    };
    if (action === "post") update.posts_count = (record.posts_count || 0) + 1;
    if (action === "reply") update.thoughtful_replies_count = (record.thoughtful_replies_count || 0) + 1;
    if (action === "appreciate") update.appreciations_given = (record.appreciations_given || 0) + 1;

    await svc.entities.ParticipationScore.update(record.id, update);

    return Response.json({
      awarded: reward,
      points: newPoints,
      level: update.level,
      leveled_up: update.level !== record.level,
    });
  } catch (error) {
    console.error("awardParticipation error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});