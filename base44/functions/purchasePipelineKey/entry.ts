import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

/**
 * purchasePipelineKey — starts a ONE-TIME full-payment checkout for an enterprise
 * Pipeline (Stripe or PayPal). On success the buyer is sent to the secure reveal
 * page, where revealPipelineKey() mints the key once.
 *
 * Body: { pipeline_id, company_name, company_email, provider? ("stripe"|"paypal") }
 * Returns: { url }  — the hosted checkout URL.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { pipeline_id, company_name, company_email, provider = "stripe" } = await req.json();
    if (!pipeline_id) return Response.json({ error: "pipeline_id is required" }, { status: 400 });

    const pipelines = await base44.asServiceRole.entities.Pipeline.filter({ id: pipeline_id });
    if (!pipelines.length) return Response.json({ error: "Pipeline not found" }, { status: 404 });
    const pipeline = pipelines[0];
    if (pipeline.active === false) return Response.json({ error: "Pipeline is not available" }, { status: 409 });

    const amount = Math.round((pipeline.price || 0) * 100); // cents
    if (amount <= 0) return Response.json({ error: "Pipeline price not configured" }, { status: 409 });

    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "https://app.altshiftx.com";

    // Create the pending key record up-front so we can reconcile it after payment.
    const keyRecord = await base44.asServiceRole.entities.PipelineKey.create({
      pipeline_id: pipeline.id,
      pipeline_slug: pipeline.slug,
      pipeline_name: pipeline.name,
      buyer_id: user.id,
      buyer_kind: pipeline.buyer_kind || "business",
      company_name: company_name || user.full_name || "",
      company_email: company_email || user.email || "",
      amount_paid: pipeline.price,
      payment_provider: provider,
      status: "pending_payment",
    });

    // Only Stripe is wired today; PayPal/Coinbase reserved for future structure.
    if (provider !== "stripe") {
      return Response.json({ error: `Provider '${provider}' is not yet enabled for pipeline keys. Please use Stripe.` }, { status: 400 });
    }

    // Admin-controlled TEST mode (matches createCheckoutSession behavior).
    const modeRows = await base44.asServiceRole.entities.PaymentMode.list("-updated_date", 1);
    const testMode = modeRows.length > 0 && modeRows[0].test_mode === true;
    const stripeKey = testMode ? Deno.env.get("STRIPE_TEST_SECRET_KEY") : Deno.env.get("STRIPE_SECRET_KEY");
    const stripe = new Stripe(stripeKey);
    if (testMode) console.log("[purchasePipelineKey] TEST MODE active");

    const session = await stripe.checkout.sessions.create({
      mode: "payment", // one-time, full payment
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: `${pipeline.name} — Enterprise Pipeline Key`,
            description: pipeline.tagline || "Alt+Shift+X enterprise pipeline access key",
          },
        },
        quantity: 1,
      }],
      success_url: `${origin}/pipeline-key/${keyRecord.id}?paid=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/marketplace`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_id: user.id,
        pipeline_id: pipeline.id,
        pipeline_key_id: keyRecord.id,
        kind: "pipeline_key",
      },
    });

    await base44.asServiceRole.entities.PipelineKey.update(keyRecord.id, {
      payment_reference: session.id,
    });

    console.log(`[purchasePipelineKey] checkout created: user=${user.id}, pipeline=${pipeline.slug}, key=${keyRecord.id}`);
    return Response.json({ url: session.url, pipeline_key_id: keyRecord.id });
  } catch (error) {
    console.error("purchasePipelineKey error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});