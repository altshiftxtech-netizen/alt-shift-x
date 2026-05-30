/**
 * checkUsageAndUpgrade — checks if a subscriber is approaching/exceeding their tier limit.
 * Fires notifications and webhook events at 85% and 100%+ usage.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const TIER_LIMITS = {
  starter:    { calls: 1000,      overage_rate: 0.05 },
  growth:     { calls: 5000,      overage_rate: 0.04 },
  pro:        { calls: 10000,     overage_rate: 0.03 },
  scale:      { calls: 50000,     overage_rate: 0.02 },
  enterprise: { calls: -1,        overage_rate: 0    },
};

const UPGRADE_PATH = {
  starter: "growth",
  growth:  "pro",
  pro:     "scale",
  scale:   "enterprise",
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
    if (tier.calls === -1) return Response.json({ status: "unlimited", used, plan });

    const usagePct = (used / tier.calls) * 100;
    const overageCount = Math.max(0, used - tier.calls);
    const nextPlan = UPGRADE_PATH[plan];

    let action = "ok";
    let overageCharge = 0;

    if (usagePct >= 100 && overageCount > 0) {
      overageCharge = Math.round(overageCount * tier.overage_rate * 100) / 100;
      action = "overage";
      console.log(`Overage: user=${user.id}, plan=${plan}, over by ${overageCount} calls, charge=$${overageCharge.toFixed(2)}`);

      // Notify user
      await base44.asServiceRole.functions.invoke("sendNotification", {
        user_id: user.id,
        type: "quota_critical",
        severity: "critical",
        title: "API Quota Exceeded",
        message: `You have exceeded your ${plan} plan limit of ${tier.calls.toLocaleString()} calls by ${overageCount.toLocaleString()} calls. Overage charges of $${overageCharge.toFixed(2)} have accrued. Upgrade to ${nextPlan || 'a higher plan'} to avoid interruption.`,
        action_url: "/pricing",
        action_label: "Upgrade Plan",
      }).catch(e => console.warn("Notification failed:", e.message));

      // Fire webhook
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
      }).catch(e => console.warn("Webhook dispatch failed:", e.message));

    } else if (usagePct >= 85) {
      action = "approaching_limit";
      console.log(`Usage alert: user=${user.id}, plan=${plan}, at ${usagePct.toFixed(0)}%`);

      // Only send notification once per period — check if already notified
      await base44.asServiceRole.functions.invoke("sendNotification", {
        user_id: user.id,
        type: "quota_warning",
        severity: "warning",
        title: `API Quota at ${Math.round(usagePct)}%`,
        message: `You've used ${used.toLocaleString()} of your ${tier.calls.toLocaleString()} monthly API calls (${Math.round(usagePct)}%). Consider upgrading to ${nextPlan || 'enterprise'} before hitting your limit.`,
        action_url: "/pricing",
        action_label: "View Plans",
      }).catch(e => console.warn("Notification failed:", e.message));
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