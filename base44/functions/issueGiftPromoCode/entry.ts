import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

const TIER_CONFIG = {
  ROCKET_FREE_MONTH: { percent_off: 100, duration: 'once', name: 'Rocket Launch — Free Month', label: '1 Free Month' },
  AIRDROP_40_PCT: { percent_off: 40, duration: 'once', name: 'Aircraft Airdrop — 40% Off', label: '40% Off' },
  DRONE_LOCK_5: { percent_off: 25, duration: 'once', name: '5 Drone/Rover Locks — 25% Off', label: '25% Off' },
  CRIMSON_SENTINEL: { percent_off: 50, duration: 'once', name: 'Crimson Sentinel — 50% Off', label: '50% Off' },
  INERT_INTERCEPT_100: { percent_off: 15, duration: 'once', name: '100 Inert Intercepts — 15% Off', label: '15% Off' },
  APEX_LIFETIME: { percent_off: 100, duration: 'forever', name: 'Apex Lifetime — 100% Off Forever', label: 'Lifetime Pass' },
};

const APP_URL = 'https://altshiftx.tech';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    const body = await req.json().catch(() => ({}));
    const { tier } = body;
    if (!tier || !TIER_CONFIG[tier]) {
      return Response.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const config = TIER_CONFIG[tier];
    const modes = await base44.asServiceRole.entities.PaymentMode.list('-updated_date', 1);
    const testMode = modes[0]?.test_mode === true;
    const stripeKey = testMode ? secrets.get('STRIPE_TEST_SECRET_KEY') : secrets.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return Response.json({ error: 'Stripe not configured' }, { status: 500 });
    }
    const stripe = new Stripe(stripeKey);
    const appId = secrets.get('BASE44_APP_ID') || '';

    // 1. Create coupon
    const coupon = await stripe.coupons.create({
      name: config.name,
      percent_off: config.percent_off,
      duration: config.duration,
      metadata: { base44_app_id: appId, gift_tier: tier, issuer_user_id: user?.id || 'guest' },
    }, { idempotencyKey: `gift-coupon-${tier}-${crypto.randomUUID()}` });

    // 2. Create single-use promotion code with 15-min expiry
    const promo = await stripe.promotionCodes.create({
      coupon: coupon.id,
      max_redemptions: 1,
      expires_at: Math.floor((Date.now() + 15 * 60 * 1000) / 1000),
      metadata: { base44_app_id: appId, gift_tier: tier, issuer_user_id: user?.id || 'guest' },
    }, { idempotencyKey: `gift-promo-${tier}-${crypto.randomUUID()}` });

    return Response.json({
      code: promo.code,
      promoId: promo.id,
      tier,
      tierLabel: config.label,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      claimUrl: `${APP_URL}/sovereignpass?promo=${promo.code}&gift=true`,
      testMode,
    });
  } catch (error) {
    console.error('[issueGiftPromoCode]', error.message);
    return Response.json({ error: error.message || 'Unable to issue gift code' }, { status: 500 });
  }
}