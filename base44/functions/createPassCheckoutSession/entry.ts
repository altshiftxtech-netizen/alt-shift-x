import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { sovereignPassTiers, passNodeIds } from '../../shared/sovereignPassCatalog.ts';
import { robotWaveUnlocked, robotWaveCoupon } from '../../shared/robotWaveReward.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Please sign in to activate a pass.' }, { status: 401 });
    const body = await req.json();
    const tier = Object.hasOwn(sovereignPassTiers, body.tierId) ? sovereignPassTiers[body.tierId] : null;
    if (!tier) return Response.json({ error: 'Choose a valid pass tier.' }, { status: 400 });
    const nodeIds = body.tierId === 'apex' ? passNodeIds : (body.nodeIds || [body.initialNode]);
    if (!Array.isArray(nodeIds) || nodeIds.length !== tier.nodes || new Set(nodeIds).size !== nodeIds.length || nodeIds.some(id => !passNodeIds.includes(id))) {
      return Response.json({ error: `Choose ${tier.nodes} distinct node${tier.nodes > 1 ? 's' : ''} for this pass.` }, { status: 400 });
    }
    const appUrl = req.headers.get('X-Base44-App-Url');
    if (!appUrl) return Response.json({ error: 'Checkout return address is unavailable. Please retry.' }, { status: 400 });
    const origin = new URL(appUrl).origin;
    const modes = await base44.asServiceRole.entities.PaymentMode.list('-updated_date', 1);
    const testMode = modes[0]?.test_mode === true;
    const stripe = new Stripe(testMode ? secrets.get('STRIPE_TEST_SECRET_KEY') : secrets.get('STRIPE_SECRET_KEY'));
    const discounted = tier.recurring && await robotWaveUnlocked(base44);
    const expectedAmount = discounted ? Math.round(tier.amount * .8) : tier.amount;
    const metadata = { base44_app_id: secrets.get('BASE44_APP_ID'), purchase_type: 'sovereign_pass', user_id: user.id, tier: body.tierId, node_ids: JSON.stringify(nodeIds), standard: 'SYS-SOVEREIGN-PASS-VERSATILITY-ENGINE-1.0', checkout_version: 'robot-waves-v1', robot_wave_discount: discounted ? '20' : '0' };
    const lineItem = testMode ? { price_data: { currency: 'usd', unit_amount: tier.amount, product_data: { name: tier.name + ' (TEST)' }, ...(tier.recurring ? { recurring: { interval: 'month' } } : {}) }, quantity: 1 } : { price: tier.priceId, quantity: 1 };
    const session = await stripe.checkout.sessions.create({
      mode: tier.recurring ? 'subscription' : 'payment', payment_method_types: ['card'],
      customer_email: user.email, line_items: [lineItem], metadata,
      ...(discounted ? { discounts: [{ coupon: robotWaveCoupon }] } : {}),
      ...(tier.recurring ? { subscription_data: { metadata } } : { payment_intent_data: { metadata } }),
      success_url: `${origin}/success/subscription?purchase=sovereign_pass&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/sovereignpass?tier=${body.tierId}&node=${nodeIds[0]}${body.tierId === 'duo' ? '&second=' + nodeIds[1] : ''}&canceled=1`,
      expires_at: Math.floor(Date.now() / 1000) + 1800,
    }, { idempotencyKey: `pass-${user.id}-${crypto.randomUUID()}` });
    let checkoutRecord;
    try {
      checkoutRecord = await base44.asServiceRole.entities.SovereignPassCheckout.create({ user_id: user.id, stripe_session_id: session.id, tier: body.tierId, expected_amount: expectedAmount, currency: 'usd', discount_percent: discounted ? 20 : 0, status: 'pending', test_mode: testMode });
    } catch (error) { await stripe.checkout.sessions.expire(session.id); throw error; }
    console.log('[createPassCheckoutSession] Created', { sessionId: session.id, tier: body.tierId, testMode, discounted });
    return Response.json({ checkoutUrl: session.url, sessionId: session.id, checkoutId: checkoutRecord.id, testMode });
  } catch (error) {
    console.error('[createPassCheckoutSession]', error.message);
    return Response.json({ error: 'Unable to open secure checkout. Please try again.' }, { status: 500 });
  }
}