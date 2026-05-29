import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const PLANS = {
  starter: "price_1TcLVDAuii7slVl8xjcUnYXz",
  pro: "price_1TcLVDAuii7slVl8e8AbgOFM",
  enterprise: "price_1TcLVDAuii7slVl8vpF3DTr6",
};

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planKey, successUrl, cancelUrl } = await req.json();

    if (!PLANS[planKey]) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Reuse existing Stripe customer if subscription exists
    let customerId;
    const existing = await base44.entities.Subscription.filter({ user_id: user.id });
    if (existing.length > 0 && existing[0].stripe_customer_id) {
      customerId = existing[0].stripe_customer_id;
    }

    const sessionParams = {
      mode: "subscription",
      line_items: [{ price: PLANS[planKey], quantity: 1 }],
      success_url: successUrl || `${req.headers.get("origin")}/dashboard/subscription?subscribed=true`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/pricing`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        plan: planKey,
        user_id: user.id,
      },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});