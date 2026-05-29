/**
 * checkUsageAndUpgrade — runs on a schedule or after API calls.
 * Checks if a subscriber is approaching/exceeding their tier limit.
 * Flags overage, sends upgrade prompt, or triggers overage billing.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";
import Stripe from "npm:stripe@14.21.0";

const TIER_LIMITS = {
  starter: { calls: 1000, overage_rate: 0.05 },   // $0.05 per call over
  growth:  { calls: 5000, overage_rate: 0.04 },
  pro:     { calls: 10000, overage_rate: 0.03 },
  scale:   { calls: 50000, overage_rate: 0.02 },
  enterprise: { calls: -1, overage_rate: 0 },      // unlimited
};

const UPGRADE_PATH = {
  starter: "growth",
  growth: "pro",
  pro: "scale",
  scale: "enterprise",
};

const UPGRADE_PRICES = {
  growth: "price_growth_monthly",     // placeholder — set real IDs
  pro: "price_1TcLVDAuii7slVl8e8AbgOFM",
  scale: "price_scale_monthly",
  enterprise: "price_1TcLVDAuii7slVl8vpF3DTr6",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({ user_id: user.id });
    if (!subscriptions.length) return Response.json({ status: "no_subscription" });

    const sub = subscriptions[0];
    const plan = sub.plan || "starter";
    const tier = TIER_LIMITS[plan] || TIER_LIMITS.starter;
    const used = sub.api_calls_used || 0;

    // Unlimited tier — nothing to check
    if (tier.calls === -1) return Response.json({ status: "unlimited", used });

    const usagePct = (used / tier.calls) * 100;
    const overageCount = Math.max(0, used - tier.calls);
    const nextPlan = UPGRADE_PATH[plan];

    let action = "ok";
    let overageCharge = 0;

    if (usagePct >= 100 && overageCount > 0) {
      // Overage — calculate charge
      overageCharge = overageCount * tier.overage_rate;
      action = "overage";
      console.log(`Overage: user=${user.id}, plan=${plan}, over by ${overageCount} calls, charge=$${overageCharge.toFixed(2)}`);

      // Fire webhook for subscriber
      await base44.asServiceRole.functions.invoke("dispatchWebhook", {
        event_type: "subscription.upgraded",
        payload: {
          user_id: user.id,
          plan,
          api_calls_used: used,
          overage_calls: overageCount,
          overage_charge_usd: overageCharge,
          upgrade_available: nextPlan,
        },
      });
    } else if (usagePct >= 85) {
      action = "approaching_limit";
      console.log(`Usage alert: user=${user.id}, plan=${plan}, at ${usagePct.toFixed(0)}%`);
    }

    return Response.json({
      status: action,
      plan,
      api_calls_used: used,
      api_calls_limit: tier.calls,
      usage_pct: Math.round(usagePct),
      overage_count: overageCount,
      overage_charge_usd: overageCharge,
      upgrade_to: nextPlan || null,
    });
  } catch (error) {
    console.error("checkUsageAndUpgrade error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});