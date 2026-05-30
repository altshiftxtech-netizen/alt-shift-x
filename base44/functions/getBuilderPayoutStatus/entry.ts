/**
 * getBuilderPayoutStatus
 * Returns the authenticated builder's:
 *  - Stripe Connect account status
 *  - All RevenueSplit records (approved + paid)
 *  - Lifetime earnings summary
 *  - BuilderBadge (tier, referral code)
 */
import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const [badges, splits] = await Promise.all([
      base44.entities.BuilderBadge.filter({ builder_id: user.id }),
      base44.entities.RevenueSplit.filter({ builder_id: user.id }),
    ]);

    const badge = badges[0] || null;

    // Check Stripe Connect status if account exists
    let stripeStatus = null;
    if (badge?.stripe_connect_account_id) {
      try {
        const account = await stripe.accounts.retrieve(badge.stripe_connect_account_id);
        stripeStatus = {
          account_id: account.id,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
          charges_enabled: account.charges_enabled,
          default_currency: account.default_currency,
          country: account.country,
          email: account.email,
        };

        // Update stored status
        if (badge && account.payouts_enabled && badge.stripe_connect_status !== "active") {
          await base44.entities.BuilderBadge.update(badge.id, { stripe_connect_status: "active" });
        }
      } catch (e) {
        stripeStatus = { error: e.message };
      }
    }

    // Earnings summary
    const allSplits = splits || [];
    const lifetimeGross = allSplits.reduce((s, r) => s + (r.gross_revenue || 0), 0);
    const lifetimePayout = allSplits.reduce((s, r) => s + (r.builder_payout || 0), 0);
    const paidOut = allSplits.filter(r => r.status === "paid").reduce((s, r) => s + (r.builder_payout || 0), 0);
    const pendingSplits = allSplits.filter(r => r.status === "pending");
    const approvedSplits = allSplits.filter(r => r.status === "approved");
    const pendingTotal = pendingSplits.reduce((s, r) => s + (r.builder_payout || 0), 0);
    const approvedTotal = approvedSplits.reduce((s, r) => s + (r.builder_payout || 0), 0);

    return Response.json({
      badge,
      stripe_status: stripeStatus,
      splits: allSplits.sort((a, b) => (b.period || "").localeCompare(a.period || "")),
      summary: {
        lifetime_gross: lifetimeGross,
        lifetime_payout: lifetimePayout,
        paid_out: paidOut,
        pending_total: pendingTotal,
        approved_total: approvedTotal,
        split_count: allSplits.length,
      },
    });

  } catch (error) {
    console.error("getBuilderPayoutStatus error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});