/**
 * stripeConnectOnboard
 * Creates or retrieves a Stripe Connect Express account for the builder
 * and returns an onboarding link URL.
 * Payload: { return_url, refresh_url }
 */
import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const origin = req.headers.get("origin") || "https://app.altshiftx.com";
    const returnUrl = body.return_url || `${origin}/builder/payout-settings?connected=true`;
    const refreshUrl = body.refresh_url || `${origin}/builder/payout-settings?refresh=true`;

    // Check if builder already has a Connect account stored
    const badges = await base44.entities.BuilderBadge.filter({ builder_id: user.id });
    let stripeAccountId = badges[0]?.stripe_connect_account_id || null;

    if (!stripeAccountId) {
      // Create a new Express account
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        metadata: {
          builder_id: user.id,
          base44_app_id: Deno.env.get("BASE44_APP_ID"),
        },
        capabilities: {
          transfers: { requested: true },
        },
      });
      stripeAccountId = account.id;
      console.log(`[stripeConnectOnboard] Created Stripe account ${stripeAccountId} for builder ${user.id}`);

      // Persist the account ID
      if (badges.length > 0) {
        await base44.entities.BuilderBadge.update(badges[0].id, {
          stripe_connect_account_id: stripeAccountId,
          stripe_connect_status: "pending",
        });
      } else {
        await base44.entities.BuilderBadge.create({
          builder_id: user.id,
          stripe_connect_account_id: stripeAccountId,
          stripe_connect_status: "pending",
          tier: "bronze",
          revenue_share_pct: 70,
        });
      }
    }

    // Generate an onboarding link (works for both new and returning accounts)
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return Response.json({ url: accountLink.url, account_id: stripeAccountId });

  } catch (error) {
    console.error("stripeConnectOnboard error:", error.message);

    // Stripe Connect not yet enabled on the platform account — give a clear, actionable message
    if (/signed up for Connect/i.test(error.message)) {
      return Response.json({
        error: "Builder payouts aren't available yet. The platform owner needs to enable Stripe Connect at https://dashboard.stripe.com/connect before builders can link a payout account.",
        code: "connect_not_enabled",
      }, { status: 503 });
    }

    return Response.json({ error: error.message }, { status: 500 });
  }
});