import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

/**
 * revealPipelineKey — securely mints and reveals an enterprise pipeline key EXACTLY
 * ONCE, only to the paying buyer, and only after Stripe confirms full payment.
 *
 * Flow:
 *  - Verify the caller is the buyer on the PipelineKey record.
 *  - Verify the linked Stripe checkout session is fully paid.
 *  - On first call: generate the key, store only its SHA-256 hash + prefix/last4,
 *    mark active + revealed, and return the plaintext ONCE.
 *  - On any later call: the plaintext is gone (only the hash remains) — return masked only.
 *
 * Body: { pipeline_key_id }
 * Returns: { key?, masked, status, already_revealed }
 */
const genKey = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint32Array(28);
  crypto.getRandomValues(bytes);
  let body = "";
  for (let i = 0; i < 28; i++) body += chars.charAt(bytes[i] % chars.length);
  // Grouped for readability: ASX-PIPE-LIVE-XXXX-XXXX-XXXX-XXXX
  const g = body.match(/.{1,4}/g).join("-");
  return `ASX-PIPE-LIVE-${g}`;
};

const sha256 = async (s) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { pipeline_key_id } = await req.json();
    if (!pipeline_key_id) return Response.json({ error: "pipeline_key_id is required" }, { status: 400 });

    const rows = await base44.asServiceRole.entities.PipelineKey.filter({ id: pipeline_key_id });
    if (!rows.length) return Response.json({ error: "Pipeline key not found" }, { status: 404 });
    const rec = rows[0];

    // Only the buyer (or an admin) may reveal.
    if (rec.buyer_id !== user.id && user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Already revealed once — never re-issue plaintext.
    if (rec.revealed) {
      return Response.json({
        already_revealed: true,
        status: rec.status,
        masked: rec.key_prefix && rec.key_last4 ? `${rec.key_prefix}…${rec.key_last4}` : null,
        message: "This key was already revealed once and cannot be shown again. Contact support if you lost it.",
      });
    }

    // Verify payment via the stored Stripe session before minting.
    const modeRows = await base44.asServiceRole.entities.PaymentMode.list("-updated_date", 1);
    const testMode = modeRows.length > 0 && modeRows[0].test_mode === true;
    const stripeKey = testMode ? Deno.env.get("STRIPE_TEST_SECRET_KEY") : Deno.env.get("STRIPE_SECRET_KEY");
    const stripe = new Stripe(stripeKey);

    if (!rec.payment_reference) {
      return Response.json({ error: "No payment reference on this key." }, { status: 409 });
    }
    const session = await stripe.checkout.sessions.retrieve(rec.payment_reference);
    if (session.payment_status !== "paid") {
      return Response.json({ error: "Payment not completed yet.", status: "pending_payment" }, { status: 402 });
    }

    // Mint the key, store ONLY the hash + safe display fragments.
    const plain = genKey();
    const hash = await sha256(plain);
    const prefix = plain.slice(0, 13);   // "ASX-PIPE-LIVE"
    const last4 = plain.slice(-4);

    await base44.asServiceRole.entities.PipelineKey.update(rec.id, {
      key_hash: hash,
      key_prefix: prefix,
      key_last4: last4,
      status: "active",
      revealed: true,
      issued_at: new Date().toISOString(),
    });

    console.log(`[revealPipelineKey] issued key for pipeline=${rec.pipeline_slug} buyer=${user.id}`);
    return Response.json({
      key: plain,
      masked: `${prefix}…${last4}`,
      status: "active",
      already_revealed: false,
      message: "Store this key securely — it is shown only once and cannot be retrieved again.",
    }, { status: 201 });
  } catch (error) {
    console.error("revealPipelineKey error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});