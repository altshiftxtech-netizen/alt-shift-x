import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const PLAN_LIMITS = {
  starter: 1000,
  pro: 10000,
  enterprise: 999999999,
};

const PRICE_TO_PLAN = {
  "price_1TcLVDAuii7slVl8xjcUnYXz": "starter",
  "price_1TcLVDAuii7slVl8e8AbgOFM": "pro",
  "price_1TcLVDAuii7slVl8vpF3DTr6": "enterprise",
};

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const planKey = session.metadata?.plan || "starter";
        const userId = session.metadata?.user_id;

        console.log(`Checkout completed: customer=${customerId}, plan=${planKey}, user=${userId}`);

        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const periodStart = new Date(stripeSubscription.current_period_start * 1000).toISOString().split("T")[0];
        const periodEnd = new Date(stripeSubscription.current_period_end * 1000).toISOString().split("T")[0];

        const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_customer_id: customerId });

        if (existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
            plan: planKey,
            status: "active",
            stripe_subscription_id: subscriptionId,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: false,
            api_calls_used: 0,
          });
        } else {
          await base44.asServiceRole.entities.Subscription.create({
            user_id: userId || "",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan: planKey,
            status: "active",
            api_calls_used: 0,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: false,
          });
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
        break;
      }

      case "invoice.paid": {
        const inv = event.data.object;
        console.log(`Invoice paid: id=${inv.id}, customer=${inv.customer}, amount=${inv.amount_paid}`);

        // Reset monthly api_calls_used on renewal
        const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_customer_id: inv.customer });
        if (existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, { api_calls_used: 0 });
        }

        // Store invoice
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
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object;
        console.log(`Invoice payment failed: id=${inv.id}, customer=${inv.customer}`);

        const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_customer_id: inv.customer });
        if (existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, { status: "past_due" });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});