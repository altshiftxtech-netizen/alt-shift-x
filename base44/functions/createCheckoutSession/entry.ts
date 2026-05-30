import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

// Builder subscription plan → Stripe price ID
const BUILDER_PLANS = {
  base_operator: "price_1TcLVDAuii7slVl8xjcUnYXz",
  strategic_architect: "price_1TcLVDAuii7slVl8e8AbgOFM",
  sovereign_commander: "price_1TcLVDAuii7slVl8vpF3DTr6",
};

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planKey, componentId, successUrl, cancelUrl } = body;
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "https://app.altshiftx.com";

    // ── Reuse existing Stripe customer if available ──────────────────────────
    let customerId;
    const existing = await base44.entities.Subscription.filter({ user_id: user.id });
    if (existing.length > 0 && existing[0].stripe_customer_id) {
      customerId = existing[0].stripe_customer_id;
    }

    const baseParams = {
      mode: "subscription",
      success_url: successUrl || `${origin}/success/subscription?subscribed=true`,
      cancel_url: cancelUrl || `${origin}/pricing`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_id: user.id,
      },
    };

    if (customerId) {
      baseParams.customer = customerId;
    } else {
      baseParams.customer_email = user.email;
    }

    // ── Route A: Per-component checkout (developer attaching a component) ────
    if (componentId) {
      const components = await base44.entities.Component.filter({ id: componentId });
      if (!components.length) {
        return Response.json({ error: "Component not found" }, { status: 404 });
      }
      const component = components[0];

      // Use stored Stripe price ID if available, otherwise create a price on the fly
      let stripePriceId = component.stripe_price_id;

      if (!stripePriceId) {
        // Create a Stripe product + recurring price for this component
        const product = await stripe.products.create({
          name: component.name,
          metadata: { component_id: component.id, component_code: component.code },
        });
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round((component.price || 49) * 100), // price in cents
          currency: "usd",
          recurring: { interval: "month" },
          metadata: { component_id: component.id },
        });
        stripePriceId = price.id;

        // Save the price ID back to the component for future reuse
        await base44.asServiceRole.entities.Component.update(component.id, {
          stripe_price_id: stripePriceId,
        });
      }

      const session = await stripe.checkout.sessions.create({
        ...baseParams,
        line_items: [{ price: stripePriceId, quantity: 1 }],
        metadata: {
          ...baseParams.metadata,
          component_id: component.id,
          component_name: component.name,
          plan: "component",
        },
      });

      console.log(`[INFO] Component checkout created: user=${user.id}, component=${component.name}`);
      return Response.json({ url: session.url });
    }

    // ── Route B: Builder subscription plan checkout ──────────────────────────
    if (planKey) {
      if (!BUILDER_PLANS[planKey]) {
        return Response.json({ error: "Invalid plan" }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        ...baseParams,
        line_items: [{ price: BUILDER_PLANS[planKey], quantity: 1 }],
        metadata: {
          ...baseParams.metadata,
          plan: planKey,
        },
      });

      console.log(`[INFO] Builder checkout created: user=${user.id}, plan=${planKey}`);
      return Response.json({ url: session.url });
    }

    return Response.json({ error: "Provide either componentId or planKey" }, { status: 400 });

  } catch (error) {
    console.error("Checkout session error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});