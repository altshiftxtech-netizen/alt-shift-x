import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// One-time admin utility: grant a complimentary top-tier (sovereign_commander)
// subscription to a specific user as a courtesy. Admin-only.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (caller?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { user_id, plan = 'sovereign_commander' } = await req.json();
    if (!user_id) {
      return Response.json({ error: 'user_id is required' }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.Subscription.filter({ user_id });
    const payload = {
      user_id,
      plan,
      status: 'active',
      payment_provider: 'stripe',
      current_period_start: '2026-06-05',
      current_period_end: '2099-12-31',
      cancel_at_period_end: false,
    };

    let result;
    if (existing.length > 0) {
      result = await base44.asServiceRole.entities.Subscription.update(existing[0].id, payload);
    } else {
      result = await base44.asServiceRole.entities.Subscription.create(payload);
    }

    return Response.json({ success: true, subscription: result });
  } catch (error) {
    console.error('grantComplimentarySubscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});