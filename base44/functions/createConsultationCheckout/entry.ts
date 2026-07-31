import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import Stripe from "npm:stripe@14.21.0";
import { finalizeConsultation } from "../../shared/consultationFinalizer.ts";

const CONSULTATION_COMPONENT_CODE = "SOV-APEX-CONSULTATION-EXECUTIVE-1.0";
const NONPROFIT_PROMO = "SOV-NONPROFIT-2027";
const DEFAULT_FEE = 2499;

// Creates a Stripe checkout session for a Sovereign consultation, OR — if a
// valid Non-Profit promo code is applied — finalizes the consultation at $0
// immediately (no Stripe redirect needed).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { consultation_id, promo_code, success_url, sovereign_member } = await req.json();
    if (!consultation_id) return Response.json({ error: "consultation_id is required" }, { status: 400 });

    // Fetch the consultation and verify ownership
    const consultations = await base44.asServiceRole.entities.SovereignConsultation.filter({ id: consultation_id });
    const consultation = consultations[0];
    if (!consultation) return Response.json({ error: "Consultation not found" }, { status: 404 });
    if (consultation.requester_id !== user.id && user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Already finalized? Return early.
    if (consultation.payment_status === "paid" || consultation.payment_status === "promo_applied") {
      return Response.json({ success: true, consultation, already_finalized: true });
    }

    // Pull the price from the SOV-APEX-CONSULTATION-EXECUTIVE-1.0 Component record
    const comps = await base44.asServiceRole.entities.Component.filter({ code: CONSULTATION_COMPONENT_CODE });
    const basePrice = comps[0]?.price != null ? comps[0].price : DEFAULT_FEE;

    const normalizedPromo = (promo_code || "").trim().toUpperCase();
    let finalPrice = basePrice;

    // ── Promo Code Validation ──
    if (normalizedPromo === NONPROFIT_PROMO) {
      // The Non-Profit Bridge: verify tax_id from the intake form
      if (!consultation.tax_id || consultation.tax_id.trim().length < 5) {
        return Response.json({ error: "Promo code SOV-NONPROFIT-2027 requires a valid Non-Profit Tax ID in the intake form." }, { status: 400 });
      }
      finalPrice = 0;
    } else if (normalizedPromo) {
      return Response.json({ error: "Invalid promo code." }, { status: 400 });
    }

    // ── Sovereign Member Path: $0 — consultation included in subscription ──
    if (sovereign_member) {
      const paymentConfirmationId = `SOV-MEMBER-${Date.now()}-${consultation_id.slice(-6).toUpperCase()}`;
      const finalized = await finalizeConsultation(base44, consultation_id, paymentConfirmationId, "SOV-SOVEREIGN-MEMBER", 0);
      return Response.json({ success: true, consultation: finalized });
    }

    // ── $0 Promo Path: finalize immediately ──
    if (finalPrice === 0) {
      const paymentConfirmationId = `PROMO-SOV-${Date.now()}-${consultation_id.slice(-6).toUpperCase()}`;
      const finalized = await finalizeConsultation(base44, consultation_id, paymentConfirmationId, NONPROFIT_PROMO, 0);
      return Response.json({ success: true, consultation: finalized });
    }

    // ── Paid Path: create Stripe checkout session ──
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
    const origin = new URL(req.url).origin;
    const finalSuccessUrl = success_url || `${origin}/consultation?consultation=success&id=${consultation_id}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: "Sovereign Apex Consultation",
            description: `SOV-APEX-CONSULTATION-EXECUTIVE-1.0 · ${consultation.company_name || consultation.requester_name || ""}`,
          },
          unit_amount: Math.round(finalPrice * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: finalSuccessUrl,
      cancel_url: `${origin}/consultation`,
      metadata: {
        purchase_type: "consultation",
        consultation_id,
        promo_code: normalizedPromo,
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
      },
      customer_email: consultation.email || user.email,
    });

    return Response.json({ checkout_url: session.url });
  } catch (error) {
    console.error("createConsultationCheckout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}