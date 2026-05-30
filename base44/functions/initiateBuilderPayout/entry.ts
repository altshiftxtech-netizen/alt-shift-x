/**
 * initiateBuilderPayout
 * Transfers approved RevenueSplit payouts to the builder's Stripe Connect account.
 * Payload: { split_ids?: string[] }  — if omitted, processes ALL approved splits for the builder.
 *
 * Flow:
 *  1. Load builder's Connect account ID from BuilderBadge
 *  2. Verify account is active (payouts_enabled)
 *  3. For each approved split, create a Stripe Transfer
 *  4. Mark splits as "paid"
 */
import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const MIN_PAYOUT_USD = 50; // minimum payout threshold

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { split_ids } = body;

    // Get builder's badge record (contains Stripe Connect account ID)
    const badges = await base44.entities.BuilderBadge.filter({ builder_id: user.id });
    const badge = badges[0];

    if (!badge?.stripe_connect_account_id) {
      return Response.json({ error: "No Stripe Connect account linked. Please set up payouts first." }, { status: 400 });
    }

    // Verify Stripe account status
    let account;
    try {
      account = await stripe.accounts.retrieve(badge.stripe_connect_account_id);
    } catch (e) {
      return Response.json({ error: `Stripe account error: ${e.message}` }, { status: 400 });
    }

    if (!account.payouts_enabled) {
      return Response.json({
        error: "Stripe account onboarding is incomplete. Please finish setting up your payout account.",
        account_id: badge.stripe_connect_account_id,
        details_submitted: account.details_submitted,
      }, { status: 400 });
    }

    // Load approved splits for this builder
    let splits;
    if (split_ids?.length) {
      // Specific splits requested
      const allApproved = await base44.entities.RevenueSplit.filter({ builder_id: user.id, status: "approved" });
      splits = allApproved.filter(s => split_ids.includes(s.id));
    } else {
      splits = await base44.entities.RevenueSplit.filter({ builder_id: user.id, status: "approved" });
    }

    if (!splits.length) {
      return Response.json({ error: "No approved revenue splits found for payout." }, { status: 400 });
    }

    const totalPayout = splits.reduce((s, r) => s + (r.builder_payout || 0), 0);

    if (totalPayout < MIN_PAYOUT_USD) {
      return Response.json({
        error: `Minimum payout is $${MIN_PAYOUT_USD}. Current approved total is $${totalPayout.toFixed(2)}.`,
        total: totalPayout,
      }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const split of splits) {
      const amountCents = Math.round((split.builder_payout || 0) * 100);
      if (amountCents < 1) continue;

      try {
        const transfer = await stripe.transfers.create({
          amount: amountCents,
          currency: "usd",
          destination: badge.stripe_connect_account_id,
          description: `Payout: ${split.component_name} — ${split.period}`,
          metadata: {
            split_id: split.id,
            builder_id: user.id,
            component_id: split.component_id,
            period: split.period,
            base44_app_id: Deno.env.get("BASE44_APP_ID"),
          },
        });

        // Mark as paid
        await base44.entities.RevenueSplit.update(split.id, {
          status: "paid",
          stripe_transfer_id: transfer.id,
          processed_at: new Date().toISOString(),
        });

        results.push({
          split_id: split.id,
          component: split.component_name,
          amount: split.builder_payout,
          transfer_id: transfer.id,
        });

        console.log(`[initiateBuilderPayout] Transferred $${split.builder_payout} for ${split.component_name} (${split.period}) → ${transfer.id}`);
      } catch (e) {
        console.error(`[initiateBuilderPayout] Failed split ${split.id}: ${e.message}`);
        errors.push({ split_id: split.id, component: split.component_name, error: e.message });
      }
    }

    return Response.json({
      success: true,
      processed: results.length,
      failed: errors.length,
      total_transferred: results.reduce((s, r) => s + r.amount, 0),
      results,
      errors,
    });

  } catch (error) {
    console.error("initiateBuilderPayout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});