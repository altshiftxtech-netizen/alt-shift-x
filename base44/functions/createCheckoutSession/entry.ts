import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const PLANS = {
  starter: "price_1TcLCmAuii7slVl8CDiSdPbb",
  pro: "price_1TcLCmAuii7slVl85LY5vIQb",
  enterprise: "price_1TcLCmAuii7slVl8SsnFcOPc",
};

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const { planKey, successUrl, cancelUrl } = await req.json();

    if (!PLANS[planKey]) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: PLANS[planKey], quantity: 1 }],
      success_url: successUrl || `${req.headers.get("origin")}/dashboard?subscribed=true`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/pricing`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        plan: planKey,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});