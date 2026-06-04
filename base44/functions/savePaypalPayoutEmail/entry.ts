/**
 * savePaypalPayoutEmail
 * Lets a builder save (or update) the PayPal email where their payouts will be sent,
 * and optionally set their preferred payout method.
 * Payload: { paypal_email?: string, payout_method?: "stripe" | "paypal" }
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { paypal_email, payout_method } = body;

    const updates = {};
    if (typeof paypal_email === "string") {
      const trimmed = paypal_email.trim();
      if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return Response.json({ error: "Please enter a valid PayPal email address." }, { status: 400 });
      }
      updates.paypal_payout_email = trimmed;
    }
    if (payout_method === "stripe" || payout_method === "paypal") {
      updates.payout_method = payout_method;
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "Nothing to update." }, { status: 400 });
    }

    const badges = await base44.entities.BuilderBadge.filter({ builder_id: user.id });
    let badge = badges[0];
    if (badge) {
      badge = await base44.entities.BuilderBadge.update(badge.id, updates);
    } else {
      badge = await base44.entities.BuilderBadge.create({ builder_id: user.id, ...updates });
    }

    return Response.json({ success: true, badge });
  } catch (error) {
    console.error("savePaypalPayoutEmail error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});