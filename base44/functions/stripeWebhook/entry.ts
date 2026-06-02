import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

// Map LIVE builder-plan price IDs → plan keys (matches createCheckoutSession + website)
const PRICE_TO_PLAN = {
  "price_1TdpP5JpBWpVB4VLCblAfpbK": "base_operator",        // $49/mo
  "price_1TdpP5JpBWpVB4VLxfqCX771": "strategic_architect",  // $199/mo
  "price_1TdpP5JpBWpVB4VLMKPm0vPI": "sovereign_commander",  // $599/mo
};

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("Missing stripe-signature header");
    return new Response("Missing stripe-signature", { status: 400 });
  }

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  try {
    console.log(`[stripeWebhook] Processing event: ${event.type}, id=${event.id}`);

    // ── Event-level idempotency: skip if this exact Stripe event was already handled ──
    // Prevents replayed/duplicate webhook deliveries from re-running side effects (double installs, double provisioning).
    const alreadyProcessed = await base44.asServiceRole.entities.ProcessedWebhookEvent.filter({ event_id: event.id });
    if (alreadyProcessed.length > 0) {
      console.log(`[stripeWebhook] Duplicate event ${event.id} — already processed, skipping.`);
      return Response.json({ received: true, duplicate: true, event_type: event.type });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const planKey = session.metadata?.plan || "starter";
        const userId = session.metadata?.user_id;
        const componentId = session.metadata?.component_id;
        const isVested = session.metadata?.vested100 === "true";

        console.log(`Checkout completed: customer=${customerId}, plan=${planKey}, user=${userId}, component=${componentId || 'n/a'}`);

        if (!subscriptionId) {
          console.warn("No subscription ID in checkout.session.completed — skipping subscription update");
          break;
        }

        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const periodStart = new Date(stripeSubscription.current_period_start * 1000).toISOString().split("T")[0];
        const periodEnd = new Date(stripeSubscription.current_period_end * 1000).toISOString().split("T")[0];

        const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_customer_id: customerId });

        // Respect the real Stripe status so the grace period (trialing) is reflected accurately.
        // trialing → builder is in their 14-day grace window; active → already billed.
        const resolvedStatus = stripeSubscription.status === "trialing" ? "trialing" : "active";

        const subData = {
          plan: planKey,
          status: resolvedStatus,
          stripe_subscription_id: subscriptionId,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          cancel_at_period_end: false,
          api_calls_used: 0,
        };
        if (isVested) subData.vested100 = true;

        let subRecordId;
        if (existing.length > 0) {
          subRecordId = existing[0].id;
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, subData);
        } else {
          const created = await base44.asServiceRole.entities.Subscription.create({
            user_id: userId || "",
            stripe_customer_id: customerId,
            ...subData,
          });
          subRecordId = created.id;
        }

        // ── Vested100 Beta welcome email — sent once, on first qualifying purchase ──
        if (isVested) {
          const subRow = (await base44.asServiceRole.entities.Subscription.filter({ id: subRecordId }))[0];
          if (subRow && !subRow.vested100_email_sent) {
            let toEmail = session.customer_details?.email || session.customer_email;
            if (!toEmail && userId) {
              const u = await base44.asServiceRole.entities.User.filter({ id: userId }).catch(() => []);
              toEmail = u[0]?.email;
            }
            if (toEmail) {
              await base44.asServiceRole.integrations.Core.SendEmail({
                to: toEmail,
                subject: "🎉 You're a Vested100 Beta Builder — 50% off for a year",
                body: `Welcome to the Alt+Shift+X Beta!\n\nYou're one of our first 100 builders, which means you've locked in 50% off your builder subscription for a full year.\n\nYour promo code: VESTED100\n\nUse this code at checkout on any future builder plan purchase to keep your 50% beta discount (valid for one year). Thank you for building with us early.\n\n— The Alt+Shift+X Team`,
              }).catch((e) => console.error("[stripeWebhook] Vested100 email failed:", e.message));
              await base44.asServiceRole.entities.Subscription.update(subRecordId, { vested100_email_sent: true });
              console.log(`[stripeWebhook] Vested100 welcome email sent to ${toEmail}`);
            }
          }
        }

        // If this was a component subscription, record the installed component
        if (componentId && userId) {
          const alreadyInstalled = await base44.asServiceRole.entities.InstalledComponent.filter({
            user_id: userId,
            component_id: componentId,
          });
          // Fetch component record for name/code/type and install count update
          const comps = await base44.asServiceRole.entities.Component.filter({ id: componentId });
          const compRecord = comps.length > 0 ? comps[0] : {};

          if (alreadyInstalled.length === 0) {
            await base44.asServiceRole.entities.InstalledComponent.create({
              user_id: userId,
              component_id: componentId,
              component_name: session.metadata?.component_name || compRecord.name || "",
              component_code: compRecord.code || "",
              component_type: compRecord.type || "X2",
              trust_score: compRecord.trust_score || 0,
              stripe_subscription_id: subscriptionId,
              status: "active",
              installed_at: new Date().toISOString().split("T")[0],
            });
            // Increment installs count on component
            if (comps.length > 0) {
              await base44.asServiceRole.entities.Component.update(componentId, {
                installs_count: (compRecord.installs_count || 0) + 1,
              });
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const customerId = sub.customer;
        const priceId = sub.items.data[0]?.price?.id;
        const periodStart = new Date(sub.current_period_start * 1000).toISOString().split("T")[0];
        const periodEnd = new Date(sub.current_period_end * 1000).toISOString().split("T")[0];

        console.log(`Subscription updated: customer=${customerId}, status=${sub.status} (e.g. trial → active transition)`);

        const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_customer_id: customerId });
        if (existing.length > 0) {
          // Only re-map the plan if the price is a known plan; otherwise preserve the
          // stored plan (builder plans aren't in PRICE_TO_PLAN, so we must not clobber them).
          const mappedPlan = PRICE_TO_PLAN[priceId];
          const updates = {
            status: sub.status,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: sub.cancel_at_period_end,
          };
          if (mappedPlan) updates.plan = mappedPlan;
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, updates);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = sub.customer;
        console.log(`Subscription cancelled: customer=${customerId}`);

        const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_customer_id: customerId });
        if (existing.length > 0) {
          // Downgrade to free: flip plan + status, but PRESERVE all underlying records
          // (profile, components, badges, installs, revenue history remain intact).
          // Paid-only benefits are simply hidden going forward via SubscriptionGate.
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
            plan: "free",
            status: "cancelled",
            cancel_at_period_end: false,
          });
          console.log(`[stripeWebhook] Downgraded customer=${customerId} to free — all records preserved, paid benefits hidden.`);
        }

        // Mark any installed components via this subscription as cancelled
        const subId = sub.id;
        const installed = await base44.asServiceRole.entities.InstalledComponent.filter({ stripe_subscription_id: subId });
        for (const inst of installed) {
          await base44.asServiceRole.entities.InstalledComponent.update(inst.id, { status: "cancelled" });
        }
        break;
      }

      case "invoice.paid": {
        const inv = event.data.object;
        console.log(`Invoice paid: id=${inv.id}, customer=${inv.customer}, amount=${inv.amount_paid / 100} ${inv.currency?.toUpperCase()}`);

        // Reset monthly api_calls_used on renewal
        const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_customer_id: inv.customer });
        if (existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, { api_calls_used: 0, status: "active" });
        }

        // Idempotent: only store if not already stored
        const existingInv = await base44.asServiceRole.entities.Invoice.filter({ stripe_invoice_id: inv.id });
        if (existingInv.length === 0) {
          await base44.asServiceRole.entities.Invoice.create({
            stripe_invoice_id: inv.id,
            stripe_customer_id: inv.customer,
            amount: inv.amount_paid,
            currency: inv.currency,
            status: "paid",
            invoice_pdf: inv.invoice_pdf,
            hosted_invoice_url: inv.hosted_invoice_url,
            period_start: inv.period_start ? new Date(inv.period_start * 1000).toISOString().split("T")[0] : null,
            period_end: inv.period_end ? new Date(inv.period_end * 1000).toISOString().split("T")[0] : null,
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object;
        console.log(`Invoice payment failed: id=${inv.id}, customer=${inv.customer}, attempt=${inv.attempt_count}`);

        const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_customer_id: inv.customer });
        if (existing.length > 0) {
          const newStatus = (inv.attempt_count || 0) >= 3 ? "unpaid" : "past_due";
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, { status: newStatus });
        }
        break;
      }

      case "invoice.upcoming": {
        // Informational — log for visibility
        const inv = event.data.object;
        console.log(`Upcoming invoice: customer=${inv.customer}, amount=${inv.amount_due / 100}`);
        break;
      }

      case "account.updated": {
        // Stripe Connect account updated — sync status
        const account = event.data.object;
        console.log(`Connect account updated: ${account.id}, payouts_enabled=${account.payouts_enabled}`);

        const badges = await base44.asServiceRole.entities.BuilderBadge.filter({ stripe_connect_account_id: account.id });
        if (badges.length > 0) {
          let newStatus = "pending";
          if (account.payouts_enabled) newStatus = "active";
          else if (account.requirements?.disabled_reason) newStatus = "restricted";
          await base44.asServiceRole.entities.BuilderBadge.update(badges[0].id, {
            stripe_connect_status: newStatus,
          });
        }
        break;
      }

      case "transfer.created": {
        const transfer = event.data.object;
        console.log(`Transfer created: ${transfer.id}, amount=${transfer.amount / 100}, destination=${transfer.destination}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Record successful processing so duplicates are ignored going forward
    await base44.asServiceRole.entities.ProcessedWebhookEvent.create({
      event_id: event.id,
      event_type: event.type,
      processed_at: new Date().toISOString(),
    }).catch((e) => console.error("Failed to record processed event:", e.message));

    return Response.json({ received: true, event_type: event.type });
  } catch (err) {
    console.error("Webhook handler error:", err.message, err.stack);
    return Response.json({ error: err.message }, { status: 500 });
  }
});