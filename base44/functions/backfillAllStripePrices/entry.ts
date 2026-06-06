import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.5.0';

// Admin/staff-callable (e.g. by The UpKeeper agent): creates Stripe products +
// recurring monthly prices for EVERY published Component missing a
// stripe_price_id, looping internally in batches until none remain (or a safety
// cap is hit). Returns a clean summary the agent can report back.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      return Response.json({ error: 'Forbidden: Admin or staff access required' }, { status: 403 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2024-06-20' });

    const body = await req.json().catch(() => ({}));
    const batchSize = Math.min(Number(body.batchSize) || 20, 25);
    const maxBatches = Math.min(Number(body.maxBatches) || 60, 100); // safety cap

    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

    // Create one component's product+price+link, retrying on Stripe rate limits
    // with exponential backoff so a busy account doesn't drop records.
    const provisionOne = async (c) => {
      const dollars = Number(c.price) || 29;
      const unitAmount = Math.round(dollars * 100);
      let attempt = 0;
      // up to 5 attempts: ~0.6s, 1.2s, 2.4s, 4.8s backoff on rate limits
      while (true) {
        try {
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
          return;
        } catch (err) {
          const isRate = err?.type === 'StripeRateLimitError' ||
            /rate limit/i.test(err?.message || '');
          attempt++;
          if (isRate && attempt < 5) {
            await sleep(600 * Math.pow(2, attempt - 1));
            continue;
          }
          throw err;
        }
      }
    };

    let totalCreated = 0;
    let totalFailed = 0;
    let batches = 0;
    const failures = [];

    while (batches < maxBatches) {
      const missing = await base44.asServiceRole.entities.Component.filter(
        { status: 'published', stripe_price_id: null },
        '-created_date',
        batchSize
      );
      if (!missing.length) break;

      // Process SEQUENTIALLY (not concurrently) to stay well under Stripe's
      // per-second API rate limit. A tiny pause between calls keeps it smooth.
      let allFailed = true;
      for (const c of missing) {
        try {
          await provisionOne(c);
          totalCreated++;
          allFailed = false;
        } catch (err) {
          totalFailed++;
          const msg = err?.message || String(err);
          console.error(`Failed for ${c.code} (${c.id}):`, msg);
          failures.push({ code: c.code, name: c.name, error: msg });
        }
        await sleep(80);
      }

      batches++;

      // If an entire batch failed, stop to avoid spinning on a broken record.
      if (allFailed) break;
    }

    // Final true remaining count.
    const stillMissing = await base44.asServiceRole.entities.Component.filter(
      { status: 'published', stripe_price_id: null },
      '-created_date',
      1
    );
    const remaining = stillMissing.length;

    return Response.json({
      created: totalCreated,
      failed: totalFailed,
      batches,
      remaining,
      done: remaining === 0,
      failures: failures.slice(0, 25),
    });
  } catch (error) {
    console.error('backfillAllStripePrices error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});