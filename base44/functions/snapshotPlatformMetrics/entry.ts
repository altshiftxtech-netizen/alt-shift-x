/**
 * snapshotPlatformMetrics — admin-only daily snapshot of platform health.
 * Run on schedule (daily) to track moat metrics: NRR, trust flywheel, governance coverage.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== "admin") return Response.json({ error: "Admin only" }, { status: 403 });

    const today = new Date().toISOString().split("T")[0];

    const [components, subscriptions, versions, governanceScores] = await Promise.all([
      base44.asServiceRole.entities.Component.list("-created_date", 500),
      base44.asServiceRole.entities.Subscription.list("-created_date", 500),
      base44.asServiceRole.entities.ComponentVersion.list("-created_date", 200),
      base44.asServiceRole.entities.GovernanceScore.list("-created_date", 500),
    ]);

    const published = components.filter(c => c.status === "published");
    const activeSubCount = subscriptions.filter(s => s.status === "active").length;
    const totalApiCalls = subscriptions.reduce((sum, s) => sum + (s.api_calls_used || 0), 0);

    // Revenue estimate
    const PLAN_PRICES = { starter: 29, growth: 59, pro: 99, scale: 249, enterprise: 299 };
    const totalRevenue = subscriptions
      .filter(s => s.status === "active")
      .reduce((sum, s) => sum + (PLAN_PRICES[s.plan] || 0), 0);

    const builderPayouts = totalRevenue * 0.7;
    const platformTake = totalRevenue * 0.3;

    const avgTrustScore = published.length
      ? published.reduce((s, c) => s + (c.trust_score || 0), 0) / published.length
      : 0;

    const certifiedCount = governanceScores.filter(g => g.certification_status === "certified").length;
    const governanceCoverage = published.length ? (certifiedCount / published.length) * 100 : 0;

    // Builders = unique builder_ids
    const uniqueBuilders = new Set(components.map(c => c.builder_id)).size;

    const snapshot = {
      period: today,
      metric_type: "daily",
      total_components: published.length,
      total_builders: uniqueBuilders,
      total_subscribers: activeSubCount,
      total_api_calls: totalApiCalls,
      total_revenue_usd: totalRevenue,
      builder_payouts_usd: builderPayouts,
      platform_take_usd: platformTake,
      new_installs: versions.filter(v => {
        const d = v.published_at || v.created_date;
        return d && d.startsWith(today);
      }).length,
      avg_trust_score: Math.round(avgTrustScore * 10) / 10,
      governance_certified_pct: Math.round(governanceCoverage),
      revenue_by_tier: subscriptions
        .filter(s => s.status === "active")
        .reduce((acc, s) => {
          acc[s.plan] = (acc[s.plan] || 0) + (PLAN_PRICES[s.plan] || 0);
          return acc;
        }, {}),
    };

    // Check if today's snapshot already exists
    const existing = await base44.asServiceRole.entities.PlatformMetric.filter({ period: today, metric_type: "daily" });
    if (existing.length > 0) {
      await base44.asServiceRole.entities.PlatformMetric.update(existing[0].id, snapshot);
    } else {
      await base44.asServiceRole.entities.PlatformMetric.create(snapshot);
    }

    console.log(`Platform snapshot: ${today} — revenue=$${totalRevenue}, subs=${activeSubCount}, components=${published.length}`);
    return Response.json(snapshot);
  } catch (error) {
    console.error("snapshotPlatformMetrics error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});