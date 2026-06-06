import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.5.0';

// Admin-only: finds every published Component missing a stripe_price_id,
// creates a Stripe product + recurring monthly price for each, and links it back.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2024-06-20' });

    // Process a limited number per invocation to stay under the time limit.
    // Re-run until remaining = 0.
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Number(body.limit) || 12, 20);

    const allMissing = await base44.asServiceRole.entities.Component.filter(
      { status: 'published', stripe_price_id: null },
      '-created_date',
      limit
    );

    // SPEED PROTOCOL: process the whole batch CONCURRENTLY instead of one-at-a-time.
    // Each component's create→price→link chain runs in parallel, so wall-clock time
    // is ~the slowest single chain rather than the sum of all of them.
    const settled = await Promise.allSettled(
      allMissing.map(async (c) => {
        const dollars = Number(c.price) || 29;
        const unitAmount = Math.round(dollars * 100);

        const product = await stripe.products.create({
          name: c.name,
          metadata: {
            base44_app_id: Deno.env.get('BASE44_APP_ID'),
            component_id: c.id,
            component_code: c.code || '',
          },
        });

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: unitAmount,
          currency: 'usd',
          recurring: { interval: 'month' },
          metadata: { component_id: c.id, component_code: c.code || '' },
        });

        await base44.asServiceRole.entities.Component.update(c.id, {
          stripe_price_id: price.id,
        });

        return { code: c.code, name: c.name, price_id: price.id, product_id: product.id };
      })
    );

    const results = [];
    let created = 0;
    let failed = 0;

    settled.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        created++;
        results.push(r.value);
      } else {
        failed++;
        const c = allMissing[i];
        console.error(`Failed for ${c.code} (${c.id}):`, r.reason?.message || r.reason);
        results.push({ code: c.code, name: c.name, error: r.reason?.message || String(r.reason) });
      }
    });

    // How many still remain after this batch (so the caller knows whether to re-run).
    const remainingBatch = await base44.asServiceRole.entities.Component.filter(
      { status: 'published', stripe_price_id: null },
      '-created_date',
      1
    );
    const remaining = remainingBatch.length;

    return Response.json({
      processed: allMissing.length,
      created,
      failed,
      remaining,
      done: remaining === 0,
      results,
    });
  } catch (error) {
    console.error('backfillStripePrices error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});