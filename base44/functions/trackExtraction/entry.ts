import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const PLAN_LIMITS = { starter: 1000, pro: 10000, enterprise: null };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { component_id } = await req.json();

    if (!component_id) {
      return Response.json({ error: "component_id is required" }, { status: 400 });
    }

    // 1. Check subscription & quota
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({ user_id: user.id });

    if (subscriptions.length === 0) {
      return Response.json({ error: "No active subscription. Please subscribe to run extractions." }, { status: 402 });
    }

    const sub = subscriptions[0];

    if (sub.status !== "active" && sub.status !== "trialing") {
      return Response.json({ error: `Subscription is ${sub.status}. Please update your billing.` }, { status: 402 });
    }

    const limit = PLAN_LIMITS[sub.plan];
    const used = sub.api_calls_used || 0;

    if (limit !== null && used >= limit) {
      return Response.json({
        error: `API quota exceeded. You have used ${used}/${limit} calls on the ${sub.plan} plan. Please upgrade to continue.`,
        quota_exceeded: true,
        used,
        limit,
      }, { status: 429 });
    }

    // 2. Increment subscription api_calls_used
    await base44.asServiceRole.entities.Subscription.update(sub.id, {
      api_calls_used: used + 1,
    });

    // 3. Increment InstalledComponent calls_this_month
    const installed = await base44.asServiceRole.entities.InstalledComponent.filter({
      user_id: user.id,
      component_id,
    });

    if (installed.length > 0) {
      const comp = installed[0];
      await base44.asServiceRole.entities.InstalledComponent.update(comp.id, {
        calls_this_month: (comp.calls_this_month || 0) + 1,
        last_used: new Date().toISOString(),
      });
    }

    console.log(`Extraction tracked: user=${user.id}, component=${component_id}, used=${used + 1}/${limit ?? "∞"}`);

    return Response.json({
      success: true,
      used: used + 1,
      limit,
      remaining: limit !== null ? limit - (used + 1) : null,
    });
  } catch (error) {
    console.error("trackExtraction error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});