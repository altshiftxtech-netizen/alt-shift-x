import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

/**
 * autoPayoutEngine — monthly automatic builder payouts.
 *
 * Finds all "approved" RevenueSplit records, groups by builder, and—if the builder
 * has an active Stripe Connect account and total ≥ MIN_PAYOUT_USD—creates Stripe
 * transfers and marks the splits "paid". Notifies each builder of their payout.
 *
 * Authorization: admin user OR internal scheduled task carrying INTERNAL_TASK_SECRET.
 */
const MIN_PAYOUT_USD = 50;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const secret = Deno.env.get("INTERNAL_TASK_SECRET");
    const internal = !!secret && body.task_secret === secret;
    if (!internal) {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== "admin") return Response.json({ error: "Admin only" }, { status: 403 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const sr = base44.asServiceRole;
    const now = new Date();

    const approved = await sr.entities.RevenueSplit.filter({ status: "approved" }).catch(() => []);
    if (!approved.length) {
      console.log("[autoPayoutEngine] No approved splits.");
      return Response.json({ success: true, builders_paid: 0, total: 0 });
    }

    // Group by builder
    const byBuilder = {};
    for (const s of approved) {
      (byBuilder[s.builder_id] ||= []).push(s);
    }

    const badges = await sr.entities.BuilderBadge.list("-created_date", 1000).catch(() => []);
    const badgeByBuilder = {}; badges.forEach(b => { badgeByBuilder[b.builder_id] = b; });

    let buildersPaid = 0, totalTransferred = 0, skipped = 0;

    for (const builderId of Object.keys(byBuilder)) {
      const splits = byBuilder[builderId];
      const badge = badgeByBuilder[builderId];
      const total = splits.reduce((s, r) => s + (r.builder_payout || 0), 0);

      if (!badge?.stripe_connect_account_id || total < MIN_PAYOUT_USD) { skipped++; continue; }

      let account;
      try { account = await stripe.accounts.retrieve(badge.stripe_connect_account_id); }
      catch (e) { console.warn(`[autoPayoutEngine] account ${builderId}: ${e.message}`); skipped++; continue; }
      if (!account.payouts_enabled) { skipped++; continue; }

      let paidThisBuilder = 0;
      for (const split of splits) {
        const cents = Math.round((split.builder_payout || 0) * 100);
        if (cents < 1) continue;
        try {
          const transfer = await stripe.transfers.create({
            amount: cents, currency: "usd",
            destination: badge.stripe_connect_account_id,
            description: `Auto payout: ${split.component_name} — ${split.period}`,
            metadata: { split_id: split.id, builder_id: builderId, period: split.period, base44_app_id: Deno.env.get("BASE44_APP_ID") },
          });
          await sr.entities.RevenueSplit.update(split.id, { status: "paid", stripe_transfer_id: transfer.id, processed_at: now.toISOString() });
          paidThisBuilder += split.builder_payout || 0;
        } catch (e) {
          console.error(`[autoPayoutEngine] transfer failed split ${split.id}: ${e.message}`);
        }
      }

      if (paidThisBuilder > 0) {
        buildersPaid++; totalTransferred += paidThisBuilder;
        await sr.functions.invoke("sendNotification", {
          user_id: builderId, type: "payout", severity: "info",
          title: "Payout sent 🎉",
          message: `Your monthly payout of $${paidThisBuilder.toFixed(2)} has been transferred to your Stripe account.`,
          action_url: "/builder/revenue", action_label: "View Revenue",
        }).catch(() => {});
      }
    }

    console.log(`[autoPayoutEngine] paid=${buildersPaid} total=$${totalTransferred.toFixed(2)} skipped=${skipped}`);
    return Response.json({ success: true, builders_paid: buildersPaid, total: totalTransferred, skipped });
  } catch (error) {
    console.error("autoPayoutEngine error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});