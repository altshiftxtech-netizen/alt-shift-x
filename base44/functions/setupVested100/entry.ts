import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

// One-time admin setup: creates the Vested100 Beta coupon (50% off for 12 months)
// and a shared promo code "VESTED100" that expires one year from creation.
// Idempotent: re-running returns the existing coupon/promo code if already present.
Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const COUPON_ID = "VESTED100_BETA";
    const PROMO_CODE = "VESTED100";

    // ── Coupon: 50% off for 12 months ──────────────────────────────────────────
    let coupon;
    try {
      coupon = await stripe.coupons.retrieve(COUPON_ID);
    } catch {
      coupon = await stripe.coupons.create({
        id: COUPON_ID,
        percent_off: 50,
        duration: "repeating",
        duration_in_months: 12,
        name: "Vested100 Beta — 50% Off for 1 Year",
        metadata: { program: "vested100" },
      });
    }

    // ── Promotion code "VESTED100": expires 1 year from now ────────────────────
    const existingCodes = await stripe.promotionCodes.list({ code: PROMO_CODE, limit: 1 });
    let promo;
    if (existingCodes.data.length > 0) {
      promo = existingCodes.data[0];
    } else {
      const oneYear = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      promo = await stripe.promotionCodes.create({
        coupon: coupon.id,
        code: PROMO_CODE,
        expires_at: oneYear,
        metadata: { program: "vested100" },
      });
    }

    console.log(`[setupVested100] Coupon=${coupon.id} PromoCode=${promo.code} expires_at=${promo.expires_at}`);
    return Response.json({
      coupon_id: coupon.id,
      promo_code: promo.code,
      promo_id: promo.id,
      expires_at: promo.expires_at,
    });
  } catch (error) {
    console.error("[setupVested100] error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});