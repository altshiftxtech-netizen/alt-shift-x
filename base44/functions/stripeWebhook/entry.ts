import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const PLAN_LIMITS = {
  starter: 1000,
  pro: 10000,
  enterprise: 999999999,
};

const PRICE_TO_PLAN = {
  "price_1TcN53Auii7slVl8tRdNcQjN": "starter",
  "price_1TcN53Auii7slVl8vnIV5uQp": "pro",
  "price_1TcN53Auii7slVl8s9oWY7F5": "enterprise",
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

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const planKey = session.metadata?.plan || "starter";
        const userId = session.metadata?.user_id;
        const componentId = session.metadata?.component_id;

        console.log(`Checkout completed: customer=${customerId}, plan=${planKey}, user=${userId}, component=${componentId || 'n/a'}`);

        if (!subscriptionId) {
          console.warn("No subscription ID in checkout.session.completed — skipping subscription update");
          break;
        }

        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const periodStart = new Date(stripeSubscription.current_period_start * 1000).toISOString().split("T")[0];
        const periodEnd = new Date(stripeSubscription.current_period_end * 1000).toISOString().split("T")[0];

        const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_customer_id: customerId });

        const subData = {
          plan: planKey,
          status: "active",
          stripe_subscription_id: subscriptionId,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          cancel_at_period_end: false,
          api_calls_used: 0,
        };

        if (existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, subData);
        } else {
          await base44.asServiceRole.entities.Subscription.create({
            user_id: userId || "",
            stripe_customer_id: customerId,
            ...subData,
          });
        }

        // If this was a component subscription, record the installed component
        if (componentId && userId) {
          const alreadyInstalled = await base44.asServiceRole.entities.InstalledComponent.filter({
            user_id: userId,
            component_id: componentId,
          });
          if (alreadyInstalled.length === 0) {
            await base44.asServiceRole.entities.InstalledComponent.create({
              user_id: userId,
              component_id: componentId,
              stripe_subscription_id: subscriptionId,
              status: "active",
              installed_at: new Date().toISOString(),
            });
            // Increment installs count on component
            const comps = await base44.asServiceRole.entities.Component.filter({ id: componentId });
            if (comps.length > 0) {
              await base44.asServiceRole.entities.Component.update(componentId, {
                installs_count: (comps[0].installs_count || 0) + 1,
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
        const planKey = PRICE_TO_PLAN[priceId] || "starter";
        const periodStart = new Date(sub.current_period_start * 1000).toISOString().split("T")[0];
        const periodEnd = new Date(sub.current_period_end * 1000).toISOString().split("T")[0];

        console.log(`Subscription updated: customer=${customerId}, plan=${planKey}, status=${sub.status}`);

        const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_customer_id: customerId });
        if (existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
            plan: planKey,
            status: sub.status,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: sub.cancel_at_period_end,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = sub.customer;
        console.log(`Subscription cancelled: customer=${customerId}`);

        const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_customer_id: customerId });
        if (existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
            status: "cancelled",
            cancel_at_period_end: false,
          });
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

    return Response.json({ received: true, event_type: event.type });
  } catch (err) {
    console.error("Webhook handler error:", err.message, err.stack);
    return Response.json({ error: err.message }, { status: 500 });
  }
});