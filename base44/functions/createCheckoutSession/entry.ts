import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

// Builder subscription plan → Stripe price ID
// free_builder has no Stripe price — it's a no-charge tier handled client-side.
const BUILDER_PLANS = {
  base_operator: "price_1TdpP5JpBWpVB4VLCblAfpbK",        // $49/mo — Base Operator (LIVE)
  strategic_architect: "price_1TdpP5JpBWpVB4VLxfqCX771",  // $199/mo — Strategic Architect (LIVE)
  sovereign_commander: "price_1TdpP5JpBWpVB4VLMKPm0vPI",  // $599/mo — Sovereign Commander (LIVE)
};

// ── Grace period (trial) for higher-commitment tiers ──────────────────────────
// Mid + top tiers get a 14-day grace window: builders start producing immediately
// and aren't charged for 14 days, while the card is collected upfront to protect
// the brand from abuse. Base/Free tiers are not granted a trial.
const TRIAL_DAYS_BY_PLAN = {
  strategic_architect: 14,
  sovereign_commander: 14,
};

// ── Vested100 Beta: 50%-off coupon auto-applied to the first 100 paid builder subs ──
// Coupon created by the setupVested100 function. Limit caps how many subs get it.
const VESTED100_COUPON = "VESTED100_BETA";
const VESTED100_LIMIT = 100;

// ── Sentinel rate limit: cap checkout-session creation per IP to stop card-testing/abuse loops ──
// In-memory window; fails open so legitimate users are never blocked by a limiter glitch.
const checkoutAttempts = new Map(); // ip -> [timestamps]
const RATE_WINDOW_MS = 60 * 1000;   // 1 minute
const RATE_MAX = 8;                 // max checkout sessions per IP per minute

function trustedIp(req) {
  // Trust only edge-set headers, not arbitrary client values
  const fwd = req.headers.get("x-forwarded-for") || "";
  return (req.headers.get("cf-connecting-ip") || fwd.split(",")[0] || "unknown").trim();
}

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate-limit by IP — silent for normal use, blocks rapid-fire abuse
    const ip = trustedIp(req);
    const now = Date.now();
    const recent = (checkoutAttempts.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length >= RATE_MAX) {
      console.warn(`[createCheckoutSession] Rate limit hit for IP ${ip}`);
      return Response.json({ error: "Too many checkout attempts. Please wait a moment and try again." }, { status: 429 });
    }
    recent.push(now);
    checkoutAttempts.set(ip, recent);

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

      const trialDays = TRIAL_DAYS_BY_PLAN[planKey];

      // ── Vested100 Beta: auto-apply 50%-off coupon to the first 100 paid builder subs ──
      const vestedCount = await base44.asServiceRole.entities.Subscription.filter({ vested100: true });
      let vestedEligible = vestedCount.length < VESTED100_LIMIT;

      // Only apply the coupon if it actually exists in this Stripe account (live vs test).
      // If it's missing, fall back to promo codes so checkout never crashes.
      if (vestedEligible) {
        try {
          await stripe.coupons.retrieve(VESTED100_COUPON);
        } catch {
          console.warn(`[createCheckoutSession] Coupon ${VESTED100_COUPON} not found — falling back to promo codes.`);
          vestedEligible = false;
        }
      }

      const session = await stripe.checkout.sessions.create({
        ...baseParams,
        line_items: [{ price: BUILDER_PLANS[planKey], quantity: 1 }],
        ...(trialDays
          ? { subscription_data: { trial_period_days: trialDays } }
          : {}),
        ...(vestedEligible
          ? { discounts: [{ coupon: VESTED100_COUPON }] }
          : { allow_promotion_codes: true }),
        metadata: {
          ...baseParams.metadata,
          plan: planKey,
          vested100: vestedEligible ? "true" : "false",
        },
      });

      console.log(`[INFO] Builder checkout created: user=${user.id}, plan=${planKey}, trialDays=${trialDays || 0}, vested100=${vestedEligible}`);
      return Response.json({ url: session.url });
    }

    return Response.json({ error: "Provide either componentId or planKey" }, { status: 400 });

  } catch (error) {
    console.error("Checkout session error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});