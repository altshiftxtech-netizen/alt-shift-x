import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// createUnzipCheckout — one-time (mode: "payment") Stripe checkout for the
// Unzipped Series. Deliberately bypasses recurring-subscription logic. The
// component stays SHELVED; we only read its metadata (name/price/code) via the
// service role to price the one-time charge. Grants lifetime access on success
// via the stripeWebhook / success page — this only mints the checkout session.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { componentId, acceptance_hash = "" } = await req.json();
    if (!componentId) return Response.json({ error: "componentId required" }, { status: 400 });

    // Read the shelved component's metadata (service role — it stays non-public).
    const rows = await base44.asServiceRole.entities.Component.filter({ id: componentId });
    if (!rows.length) return Response.json({ error: "Component not found" }, { status: 404 });
    const component = rows[0];

    // Only allow one-time checkout for the Unzipped Series (UNZIP-* codes).
    if (!String(component.code || "").toUpperCase().startsWith("UNZIP")) {
      return Response.json({ error: "This item is not part of the Unzipped Series one-time path." }, { status: 400 });
    }

    // Admin-controlled TEST mode mirrors createCheckoutSession.
    const modeRows = await base44.asServiceRole.entities.PaymentMode.list("-updated_date", 1);
    const testMode = modeRows.length > 0 && modeRows[0].test_mode === true;
    const stripeKey = testMode ? Deno.env.get("STRIPE_TEST_SECRET_KEY") : Deno.env.get("STRIPE_SECRET_KEY");
    const stripe = new Stripe(stripeKey);
    if (testMode) console.log("[createUnzipCheckout] TEST MODE active");

    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "https://app.altshiftx.com";

    // Reuse an existing Stripe customer if we have one.
    let customerId;
    const existing = await base44.asServiceRole.entities.Subscription.filter({ user_id: user.id });
    if (existing.length > 0 && existing[0].stripe_customer_id) customerId = existing[0].stripe_customer_id;

    const session = await stripe.checkout.sessions.create({
      mode: "payment", // ONE-TIME — no recurring billing
      ...(customerId ? { customer: customerId } : { customer_email: user.email }),
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: Math.round((component.price || 29) * 100),
          product_data: {
            name: component.name,
            metadata: { component_id: component.id, component_code: component.code },
          },
        },
        quantity: 1,
      }],
      success_url: `${origin}/success/install?component=${encodeURIComponent(component.name)}&id=${component.id}&unzip=1`,
      cancel_url: `${origin}/speakeasy/ballroom`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_id: user.id,
        component_id: component.id,
        component_code: component.code,
        purchase_type: "unzip_one_time",
        license_type: "lifetime_sovereign",
        version: "V1.0.0",
        acceptance_hash,
      },
    });

    console.log(`[INFO] Unzip one-time checkout created: user=${user.id}, component=${component.code}`);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("[createUnzipCheckout] error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});