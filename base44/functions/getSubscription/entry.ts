import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const PLAN_LIMITS = { starter: 1000, pro: 10000, enterprise: 999999999 };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await base44.entities.Subscription.filter({ user_id: user.id });
    const invoices = await base44.entities.Invoice.filter({ user_id: user.id });

    if (subscriptions.length === 0) {
      return Response.json({ subscription: null, invoices: [] });
    }

    const sub = subscriptions[0];
    const limit = PLAN_LIMITS[sub.plan] || 1000;

    return Response.json({
      subscription: { ...sub, limit },
      invoices: invoices.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
    });
  } catch (error) {
    console.error("getSubscription error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});