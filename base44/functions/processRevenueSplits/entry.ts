/**
 * processRevenueSplits — automated monthly revenue splitting.
 * Calculates gross revenue per component per builder, applies tier-based
 * revenue share %, creates RevenueSplit records.
 * Admin-only. Run on 1st of each month.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const TIER_SHARE = { platinum: 85, gold: 77, silver: 72, bronze: 70 };
const CERT_BONUS = { platinum: 10, gold: 5, silver: 2, bronze: 0 };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== "admin") {
      return Response.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const now = new Date();
    const periodDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const period = body.period || `${periodDate.getFullYear()}-${String(periodDate.getMonth() + 1).padStart(2, "0")}`;

    console.log(`[processRevenueSplits] Processing period: ${period}`);

    const [components, allInstalled, builderBadges, govScores] = await Promise.all([
      base44.asServiceRole.entities.Component.filter({ status: "published" }),
      base44.asServiceRole.entities.InstalledComponent.list("-created_date", 5000),
      base44.asServiceRole.entities.BuilderBadge.list("-last_calculated", 500),
      base44.asServiceRole.entities.GovernanceScore.list("-overall_score", 500),
    ]);

    const badgeMap = {};
    for (const b of builderBadges) badgeMap[b.builder_id] = b;

    const govMap = {};
    for (const g of govScores) govMap[g.component_id] = g;

    const [periodYear, periodMonth] = period.split("-").map(Number);
    const periodEnd = new Date(periodYear, periodMonth, 1).getTime();

    const periodInstalls = allInstalled.filter(i => {
      return new Date(i.created_date).getTime() < periodEnd;
    });

    const splits = [];
    for (const comp of components) {
      const compInstalls = periodInstalls.filter(i => i.component_id === comp.id);
      if (!compInstalls.length) continue;

      const grossRevenue = (comp.price || 0) * compInstalls.length;
      if (grossRevenue === 0) continue;

      const badge = badgeMap[comp.builder_id];
      const tier = badge?.tier || "bronze";
      const basePct = TIER_SHARE[tier] || 70;
      const gov = govMap[comp.id];
      const certBonus = gov?.certification_status === "certified" ? (CERT_BONUS[tier] || 0) : 0;

      const builderMonthlyRev = badge?.total_revenue || 0;
      let volumeRebate = 0;
      if (tier === "platinum" && builderMonthlyRev > 50000) volumeRebate = 5;
      else if (tier === "gold" && builderMonthlyRev > 10000) volumeRebate = 2.5;

      const finalPct = Math.min(basePct + certBonus + volumeRebate, 95);
      const builderPayout = Math.round(grossRevenue * finalPct / 100 * 100) / 100;
      const platformTake = Math.round((grossRevenue - builderPayout) * 100) / 100;

      const existing = await base44.asServiceRole.entities.RevenueSplit.filter({
        period,
        component_id: comp.id,
      });

      const splitData = {
        period,
        builder_id: comp.builder_id,
        component_id: comp.id,
        component_name: comp.name,
        gross_revenue: grossRevenue,
        builder_pct: finalPct,
        builder_payout: builderPayout,
        platform_take: platformTake,
        certification_bonus_pct: certBonus,
        volume_rebate_pct: volumeRebate,
        tier_at_period: tier,
        status: "pending",
      };

      if (existing.length > 0) {
        await base44.asServiceRole.entities.RevenueSplit.update(existing[0].id, splitData);
      } else {
        await base44.asServiceRole.entities.RevenueSplit.create(splitData);
      }

      splits.push({ component: comp.name, builder: comp.builder_id, grossRevenue, builderPayout, platformTake, tier, finalPct });
      console.log(`[Split] ${comp.name}: $${grossRevenue} gross → builder gets $${builderPayout} (${finalPct}%), platform $${platformTake}`);
    }

    const totalGross = splits.reduce((s, r) => s + r.grossRevenue, 0);
    const totalPayout = splits.reduce((s, r) => s + r.builderPayout, 0);
    const totalPlatform = splits.reduce((s, r) => s + r.platformTake, 0);

    return Response.json({
      period,
      components_processed: splits.length,
      total_gross_revenue: totalGross,
      total_builder_payouts: totalPayout,
      total_platform_take: totalPlatform,
      splits,
    });

  } catch (error) {
    console.error("processRevenueSplits error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});