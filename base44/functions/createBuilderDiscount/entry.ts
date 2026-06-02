import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2024-06-20' });

    const { componentId, percentOff, code, maxRedemptions, expiresAt } = await req.json();
    if (!componentId || !percentOff || !code) {
      return Response.json({ error: 'componentId, percentOff and code are required' }, { status: 400 });
    }
    const pct = Number(percentOff);
    if (pct < 1 || pct > 100) {
      return Response.json({ error: 'percentOff must be between 1 and 100' }, { status: 400 });
    }

    // Component must belong to this builder
    const comp = await base44.asServiceRole.entities.Component.filter({ id: componentId }).then((r) => r[0]);
    if (!comp) return Response.json({ error: 'Component not found' }, { status: 404 });
    if (comp.builder_id !== user.id) {
      return Response.json({ error: 'You can only create discounts for components you own' }, { status: 403 });
    }

    // POLICY: discounts apply ONLY to a builder's own standalone components — NOT paired kits.
    // Block if this component is part of any accepted/pending kit pairing.
    const asRequester = await base44.asServiceRole.entities.KitPairing.filter({ requester_component_id: componentId });
    const asPartner = await base44.asServiceRole.entities.KitPairing.filter({ partner_component_id: componentId });
    const lockedInKit = [...asRequester, ...asPartner].some((p) => ['pending', 'accepted'].includes(p.status));
    if (lockedInKit) {
      return Response.json({
        error: 'This component is part of a kit pairing. Per policy, discounts cannot be applied to paired-kit components — only standalone components.',
      }, { status: 409 });
    }

    // Create Stripe coupon (percent off) + a shareable promotion code
    const coupon = await stripe.coupons.create({
      percent_off: pct,
      duration: 'once',
      name: `${comp.name} — ${pct}% off`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        builder_id: user.id,
        component_id: componentId,
      },
    });

    const promo = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: code.toUpperCase().replace(/\s+/g, ''),
      max_redemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
      expires_at: expiresAt ? Math.floor(new Date(expiresAt).getTime() / 1000) : undefined,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        builder_id: user.id,
        component_id: componentId,
      },
    });

    const discount = await base44.asServiceRole.entities.BuilderDiscount.create({
      builder_id: user.id,
      builder_name: comp.builder_name || user.full_name,
      component_id: componentId,
      component_name: comp.name,
      code: promo.code,
      percent_off: pct,
      stripe_coupon_id: coupon.id,
      stripe_promotion_code_id: promo.id,
      max_redemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
      expires_at: expiresAt || undefined,
      status: 'active',
      created_via_bob: true,
    });

    return Response.json({ success: true, discount, shareCode: promo.code });
  } catch (error) {
    console.error('createBuilderDiscount error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});