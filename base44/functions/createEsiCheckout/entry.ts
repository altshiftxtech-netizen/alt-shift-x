import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// One-time $10 ESI Legal Export unlock — grants a single download for one BOB project.
const ESI_PRICE_ID = "price_1Tdxi6JpBWpVB4VL9LJjjk7H"; // $10.00 one-time (LIVE)

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { conversationId, conversationName } = await req.json();
    if (!conversationId) {
      return Response.json({ error: "Missing conversationId" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "https://app.altshiftx.com";

    // Reuse existing Stripe customer if available
    let customerId;
    const existing = await base44.entities.Subscription.filter({ user_id: user.id });
    if (existing.length > 0 && existing[0].stripe_customer_id) {
      customerId = existing[0].stripe_customer_id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: ESI_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/builder/bob?esi_unlocked=${conversationId}`,
      cancel_url: `${origin}/builder/bob`,
      ...(customerId ? { customer: customerId } : { customer_email: user.email }),
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_id: user.id,
        purchase_type: "esi_unlock",
        conversation_id: conversationId,
        conversation_name: (conversationName || "").slice(0, 200),
      },
    });

    console.log(`[INFO] ESI unlock checkout created: user=${user.id}, conversation=${conversationId}`);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("[createEsiCheckout]", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});