import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// Sovereign: Enterprise Intelligence — base subscription + optional Builder Seats.
// LIVE price IDs (created in the Stripe live catalog).
const SOVEREIGN_BASE_PRICE = "price_1TpnDPJpBWpVB4VLBtkFQvI4";  // $2,499/mo
const SOVEREIGN_SEAT_PRICE = "price_1TpnDSJpBWpVB4VLeLdkvPV7";  // $4,999/mo per Builder Seat

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { seats, successUrl, cancelUrl } = await req.json();
    const seatCount = Math.max(0, Math.min(50, parseInt(seats, 10) || 0));

    // Admin TEST-mode support: mint ephemeral test prices so live prices stay intact.
    const modeRows = await base44.asServiceRole.entities.PaymentMode.list("-updated_date", 1);
    const testMode = modeRows.length > 0 && modeRows[0].test_mode === true;
    const stripeKey = testMode ? Deno.env.get("STRIPE_TEST_SECRET_KEY") : Deno.env.get("STRIPE_SECRET_KEY");
    const stripe = new Stripe(stripeKey);

    let basePrice = SOVEREIGN_BASE_PRICE;
    let seatPrice = SOVEREIGN_SEAT_PRICE;
    if (testMode) {
      const baseProd = await stripe.products.create({ name: "Sovereign: Enterprise Intelligence (TEST)" });
      basePrice = (await stripe.prices.create({ product: baseProd.id, unit_amount: 249900, currency: "usd", recurring: { interval: "month" } })).id;
      const seatProd = await stripe.products.create({ name: "Sovereign Builder Seat (TEST)" });
      seatPrice = (await stripe.prices.create({ product: seatProd.id, unit_amount: 499900, currency: "usd", recurring: { interval: "month" } })).id;
      console.log("[createSovereignCheckout] TEST MODE active");
    }

    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "https://app.altshiftx.com";

    let customerId;
    const existing = await base44.asServiceRole.entities.Subscription.filter({ user_id: user.id });
    if (existing.length > 0 && existing[0].stripe_customer_id) customerId = existing[0].stripe_customer_id;

    const line_items = [{ price: basePrice, quantity: 1 }];
    if (seatCount > 0) line_items.push({ price: seatPrice, quantity: seatCount });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items,
      success_url: successUrl || `${origin}/success/subscription?subscribed=true&plan=sovereign`,
      cancel_url: cancelUrl || `${origin}/pricing`,
      ...(customerId ? { customer: customerId } : { customer_email: user.email }),
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_id: user.id,
        plan: "enterprise",
        sovereign_seats: String(seatCount),
      },
    });

    console.log(`[INFO] Sovereign checkout created: user=${user.id}, seats=${seatCount}, test=${testMode}`);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("createSovereignCheckout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});