import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.5.0';

// Opens the Stripe Customer Portal so the user can update their card / bank,
// view invoices, and manage their subscription.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2024-12-18.acacia' });

    // Find the user's subscription record to get their Stripe customer id
    const subs = await base44.asServiceRole.entities.Subscription.filter({ user_id: user.id });
    let customerId = subs?.[0]?.stripe_customer_id;

    // Fall back to looking up the customer by email if we don't have one stored
    if (!customerId) {
      const existing = await stripe.customers.list({ email: user.email, limit: 1 });
      customerId = existing.data?.[0]?.id;
    }

    if (!customerId) {
      return Response.json({
        error: 'No billing account found. Subscribe to a plan first to manage your payment method.'
      }, { status: 404 });
    }

    const { return_url } = await req.json().catch(() => ({}));

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: return_url || `https://${Deno.env.get('BASE44_APP_ID')}.base44.app/dashboard/settings`,
    });

    return Response.json({ url: portal.url });
  } catch (error) {
    console.error('createBillingPortalSession error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});