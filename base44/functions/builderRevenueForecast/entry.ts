/**
 * builderRevenueForecast — predictive revenue model for a builder.
 * Uses installed component data, trust scores, and platform growth trends
 * to project 30/60/90-day revenue for the authenticated builder.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const [myComponents, allInstalled, govScores, platformMetrics] = await Promise.all([
      base44.entities.Component.filter({ builder_id: user.id }),
      base44.asServiceRole.entities.InstalledComponent.list("-created_date", 1000),
      base44.asServiceRole.entities.GovernanceScore.filter({ }),
      base44.asServiceRole.entities.PlatformMetric.list("-created_date", 12),
    ]);

    const published = myComponents.filter(c => c.status === "published");
    if (!published.length) {
      return Response.json({ error: "No published components to forecast" }, { status: 400 });
    }

    // Build per-component metrics
    const componentMetrics = published.map(comp => {
      const installs = allInstalled.filter(i => i.component_id === comp.id);
      const calls = installs.reduce((s, i) => s + (i.calls_this_month || 0), 0);
      const gov = govScores.find(g => g.component_id === comp.id);
      const certified = gov?.certification_status === "certified";
      return {
        id: comp.id,
        name: comp.name,
        type: comp.type,
        price: comp.price || 0,
        installs: installs.length,
        calls_this_month: calls,
        trust_score: comp.trust_score || 0,
        certified,
        monthly_revenue: (comp.price || 0) * installs.length,
      };
    });

    const totalCurrentRevenue = componentMetrics.reduce((s, c) => s + c.monthly_revenue, 0);
    const totalInstalls = componentMetrics.reduce((s, c) => s + c.installs, 0);
    const avgTrust = componentMetrics.length
      ? Math.round(componentMetrics.reduce((s, c) => s + c.trust_score, 0) / componentMetrics.length)
      : 0;

    // Compute platform growth rate from snapshots
    const sortedMetrics = [...platformMetrics].sort((a, b) => (a.period || "").localeCompare(b.period || ""));
    let platformGrowthRate = 0.08; // default 8%/month
    if (sortedMetrics.length >= 2) {
      const first = sortedMetrics[0].total_revenue_usd || 0;
      const last = sortedMetrics[sortedMetrics.length - 1].total_revenue_usd || 0;
      if (first > 0) platformGrowthRate = Math.min(0.5, Math.max(0, (last - first) / first / sortedMetrics.length));
    }

    // LLM-powered predictive model
    const forecastPrompt = `You are a SaaS revenue analyst specializing in AI component marketplaces.

Builder portfolio:
${componentMetrics.map(c =>
  `- ${c.name} (${c.type}): $${c.price}/mo, ${c.installs} installs, ${c.calls_this_month} API calls/mo, trust=${c.trust_score}, certified=${c.certified}`
).join("\n")}

Current monthly gross revenue: $${totalCurrentRevenue}
Total installs: ${totalInstalls}
Average trust score: ${avgTrust}/100
Platform monthly growth rate: ${Math.round(platformGrowthRate * 100)}%
Builder payout share: 70% base (up to 85% with bonuses)

Generate a realistic 30/60/90-day revenue forecast. Consider:
- Install growth based on trust score and certification status
- Marketplace visibility effects of governance certification
- Churn risk for uncertified components
- API call volume trends → usage-based upsell potential

Return ONLY valid JSON:
{
  "forecast_30d": { "revenue": number, "installs": number, "confidence": number },
  "forecast_60d": { "revenue": number, "installs": number, "confidence": number },
  "forecast_90d": { "revenue": number, "installs": number, "confidence": number },
  "payout_30d": number,
  "payout_60d": number,
  "payout_90d": number,
  "growth_drivers": [string],
  "churn_risks": [string],
  "top_opportunity": string,
  "recommended_action": string
}`;

    const forecast = await base44.integrations.Core.InvokeLLM({
      prompt: forecastPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          forecast_30d: { type: "object" },
          forecast_60d: { type: "object" },
          forecast_90d: { type: "object" },
          payout_30d: { type: "number" },
          payout_60d: { type: "number" },
          payout_90d: { type: "number" },
          growth_drivers: { type: "array", items: { type: "string" } },
          churn_risks: { type: "array", items: { type: "string" } },
          top_opportunity: { type: "string" },
          recommended_action: { type: "string" },
        },
      },
    });

    // Save forecast record
    await base44.asServiceRole.entities.Forecast.create({
      forecast_type: "revenue",
      period: "next_90_days",
      component_id: "builder_portfolio",
      historical_data_points: componentMetrics.length,
      confidence_score: forecast.forecast_30d?.confidence || 70,
      predicted_variance: forecast.forecast_30d?.revenue - totalCurrentRevenue,
      variance_direction: forecast.forecast_30d?.revenue > totalCurrentRevenue ? "growth" : "decline",
      predicted_resource_usage: forecast.forecast_30d?.installs || totalInstalls,
      trend_analysis: `30d: $${forecast.forecast_30d?.revenue} | 60d: $${forecast.forecast_60d?.revenue} | 90d: $${forecast.forecast_90d?.revenue}`,
      recommendations: forecast.growth_drivers || [],
      risk_factors: forecast.churn_risks || [],
      forecast_accuracy: (forecast.forecast_30d?.confidence || 0) >= 80 ? "high" : "medium",
      generated_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      current_monthly_revenue: totalCurrentRevenue,
      current_payout: Math.round(totalCurrentRevenue * 0.7),
      component_metrics: componentMetrics,
      forecast,
      platform_growth_rate_pct: Math.round(platformGrowthRate * 100),
    });

  } catch (error) {
    console.error("builderRevenueForecast error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});