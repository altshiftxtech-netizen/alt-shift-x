/**
 * computeBuilderBadges — recalculates tier, badges, and leaderboard score for all builders.
 * Called nightly by scheduler. Can also be triggered manually by admin.
 *
 * Tier rules:
 *   Bronze:   1+ published components
 *   Silver:   5+ total installs + avg_rating >= 4.0
 *   Gold:     25+ total installs + avg_rating >= 4.5
 *   Platinum: 100+ total installs + avg_rating >= 4.8
 *
 * Revenue share by tier:
 *   Bronze: 70%  | Silver: 72%  | Gold: 77%  | Platinum: 85%
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const TIERS = [
  { key: "platinum", installs: 100, rating: 4.8, revenue_share: 85 },
  { key: "gold",     installs: 25,  rating: 4.5, revenue_share: 77 },
  { key: "silver",   installs: 5,   rating: 4.0, revenue_share: 72 },
  { key: "bronze",   installs: 0,   rating: 0,   revenue_share: 70 },
];

function assignTier(totalInstalls, avgRating) {
  for (const t of TIERS) {
    if (totalInstalls >= t.installs && avgRating >= t.rating) return t;
  }
  return TIERS[TIERS.length - 1];
}

function computeAchievements(row, allRows) {
  const badges = [];
  if (allRows.length === 0) return badges;
  const topRevBuilder = allRows.reduce((a, b) => b.total_revenue > a.total_revenue ? b : a, allRows[0]);
  if (topRevBuilder?.builder_id === row.builder_id && row.total_revenue > 0) badges.push("top_seller");
  if (row.component_count >= 3) badges.push("speed_builder");
  if ((row.avg_trust || 0) >= 85) badges.push("trust_champion");
  if (row.component_count > 0 && row.certified_count === row.component_count) badges.push("governance_ace");
  const sorted = [...allRows].sort((a, b) => b.monthly_installs - a.monthly_installs);
  if (sorted.slice(0, 3).some(r => r.builder_id === row.builder_id) && row.monthly_installs > 0) badges.push("trending");
  return badges;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Authorize: must be an admin user OR an internal scheduled task carrying the secret.
    const internalSecret = Deno.env.get("INTERNAL_TASK_SECRET");
    const isInternalTask = !!internalSecret && body.task_secret === internalSecret;
    if (!isInternalTask) {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== "admin") {
        return Response.json({ error: "Admin only" }, { status: 403 });
      }
    }

    const [components, allInstalled, govScores, reviews, existingBadges] = await Promise.all([
      base44.asServiceRole.entities.Component.filter({ status: "published" }),
      base44.asServiceRole.entities.InstalledComponent.list("-created_date", 2000),
      base44.asServiceRole.entities.GovernanceScore.list("-overall_score", 500),
      base44.asServiceRole.entities.Review.list("-created_date", 2000),
      base44.asServiceRole.entities.BuilderBadge.list("-last_calculated", 500),
    ]);

    const govMap = {};
    for (const g of govScores) govMap[g.component_id] = g;

    const badgeMap = {};
    for (const b of existingBadges) badgeMap[b.builder_id] = b;

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const builderMap = {};
    for (const comp of components) {
      const bid = comp.builder_id;
      if (!builderMap[bid]) {
        builderMap[bid] = {
          builder_id: bid,
          component_count: 0,
          certified_count: 0,
          total_installs: 0,
          monthly_installs: 0,
          total_revenue: 0,
          avg_trust: 0,
          rating_sum: 0,
          rating_count: 0,
        };
      }
      const b = builderMap[bid];
      const compInstalls = allInstalled.filter(i => i.component_id === comp.id);
      const recentInstalls = compInstalls.filter(i => new Date(i.created_date).getTime() > thirtyDaysAgo);
      const compReviews = reviews.filter(r => r.component_id === comp.id);
      const gov = govMap[comp.id];

      b.component_count++;
      b.total_installs += compInstalls.length;
      b.monthly_installs += recentInstalls.length;
      b.total_revenue += (comp.price || 0) * compInstalls.length;
      b.avg_trust += comp.trust_score || 0;
      if (gov?.certification_status === "certified") b.certified_count++;
      for (const rev of compReviews) {
        if (rev.rating) { b.rating_sum += rev.rating; b.rating_count++; }
      }
    }

    const rows = Object.values(builderMap).map(b => {
      b.avg_trust = b.component_count ? Math.round(b.avg_trust / b.component_count) : 0;
      b.avg_rating = b.rating_count ? Math.round((b.rating_sum / b.rating_count) * 10) / 10 : 0;
      const tier = assignTier(b.total_installs, b.avg_rating);
      b.tier = tier.key;
      b.revenue_share_pct = tier.revenue_share;
      b.leaderboard_score = Math.round(
        Math.min(b.total_installs / 100, 1) * 40 +
        Math.min(b.total_revenue / 5000, 1) * 30 +
        (b.avg_trust / 100) * 20 +
        (b.certified_count / Math.max(b.component_count, 1)) * 10
      );
      b.momentum_score = b.monthly_installs;
      return b;
    });

    for (const row of rows) {
      row.badges_earned = computeAchievements(row, rows);
    }

    const now = new Date().toISOString();
    for (const row of rows) {
      const existing = badgeMap[row.builder_id];
      // Preserve stripe fields if they exist
      const stripeFields = existing ? {
        stripe_connect_account_id: existing.stripe_connect_account_id,
        stripe_connect_status: existing.stripe_connect_status,
        referral_code: existing.referral_code,
        referral_count: existing.referral_count,
        referral_earnings: existing.referral_earnings,
      } : {};

      const data = {
        builder_id: row.builder_id,
        tier: row.tier,
        total_installs: row.total_installs,
        monthly_installs: row.monthly_installs,
        avg_rating: row.avg_rating,
        total_revenue: row.total_revenue,
        component_count: row.component_count,
        certified_count: row.certified_count,
        momentum_score: row.momentum_score,
        leaderboard_score: row.leaderboard_score,
        badges_earned: row.badges_earned,
        revenue_share_pct: row.revenue_share_pct,
        last_calculated: now,
        ...stripeFields,
      };

      if (existing) {
        await base44.asServiceRole.entities.BuilderBadge.update(existing.id, data);
      } else {
        data.referral_code = `BLD-${row.builder_id.slice(0, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        data.referral_count = 0;
        data.referral_earnings = 0;
        await base44.asServiceRole.entities.BuilderBadge.create(data);
      }
    }

    console.log(`[computeBuilderBadges] Updated ${rows.length} builders`);
    return Response.json({ updated: rows.length, results: rows.map(r => ({ builder_id: r.builder_id, tier: r.tier, score: r.leaderboard_score })) });

  } catch (error) {
    console.error("computeBuilderBadges error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});