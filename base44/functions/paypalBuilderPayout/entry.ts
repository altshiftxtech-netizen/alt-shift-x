/**
 * paypalBuilderPayout
 * Pays approved RevenueSplit earnings to the builder's PayPal account via the
 * PayPal Payouts API (single batch, multiple items). Mirrors initiateBuilderPayout
 * but uses PayPal instead of Stripe Connect.
 * Payload: { split_ids?: string[] } — if omitted, processes ALL approved splits.
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

const PAYPAL_API = "https://api-m.paypal.com"; // LIVE
const MIN_PAYOUT_USD = 50;

async function paypalToken() {
  const id = Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = Deno.env.get("PAYPAL_SECRET");
  const auth = btoa(`${id}:${secret}`);
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  return (await res.json()).access_token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { split_ids } = body;

    const badges = await base44.entities.BuilderBadge.filter({ builder_id: user.id });
    const badge = badges[0];

    if (!badge?.paypal_payout_email) {
      return Response.json({ error: "No PayPal email on file. Please add your PayPal payout email first." }, { status: 400 });
    }

    // Tax compliance gate: a completed W-9 is required before any payout can be released.
    const w9s = await base44.entities.TaxForm1099.filter({ builder_id: user.id });
    if (!w9s.some((f) => f.w9_completed)) {
      return Response.json({
        error: "Payout blocked: you must complete your W-9 tax form before receiving earnings.",
        code: "w9_required",
      }, { status: 400 });
    }

    // Load approved splits
    let splits;
    if (split_ids?.length) {
      const allApproved = await base44.entities.RevenueSplit.filter({ builder_id: user.id, status: "approved" });
      splits = allApproved.filter((s) => split_ids.includes(s.id));
    } else {
      splits = await base44.entities.RevenueSplit.filter({ builder_id: user.id, status: "approved" });
    }

    if (!splits.length) {
      return Response.json({ error: "No approved revenue splits found for payout." }, { status: 400 });
    }

    const payable = splits.filter((s) => (s.builder_payout || 0) > 0);
    const totalPayout = payable.reduce((s, r) => s + (r.builder_payout || 0), 0);

    if (totalPayout < MIN_PAYOUT_USD) {
      return Response.json({
        error: `Minimum payout is $${MIN_PAYOUT_USD}. Current approved total is $${totalPayout.toFixed(2)}.`,
        total: totalPayout,
      }, { status: 400 });
    }

    const token = await paypalToken();
    const batchId = `payout_${user.id.slice(0, 8)}_${Date.now()}`;

    const items = payable.map((split) => ({
      recipient_type: "EMAIL",
      amount: { value: (split.builder_payout || 0).toFixed(2), currency: "USD" },
      receiver: badge.paypal_payout_email,
      note: `Payout: ${split.component_name} — ${split.period}`,
      sender_item_id: split.id,
    }));

    const res = await fetch(`${PAYPAL_API}/v1/payments/payouts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_batch_header: {
          sender_batch_id: batchId,
          email_subject: "Your Alt+Shift+X builder payout",
          email_message: "Your approved component revenue has been sent to your PayPal account.",
        },
        items,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("[paypalBuilderPayout] PayPal error:", JSON.stringify(data));
      return Response.json({ error: data.message || `PayPal payout failed: ${res.status}` }, { status: 400 });
    }

    const payoutBatchId = data.batch_header?.payout_batch_id || batchId;

    // Mark splits as paid
    const results = [];
    for (const split of payable) {
      await base44.entities.RevenueSplit.update(split.id, {
        status: "paid",
        payout_provider: "paypal",
        paypal_payout_batch_id: payoutBatchId,
        processed_at: new Date().toISOString(),
      });
      results.push({ split_id: split.id, component: split.component_name, amount: split.builder_payout });
      console.log(`[paypalBuilderPayout] Paid $${split.builder_payout} for ${split.component_name} (${split.period}) → batch ${payoutBatchId}`);
    }

    return Response.json({
      success: true,
      processed: results.length,
      failed: 0,
      total_transferred: results.reduce((s, r) => s + r.amount, 0),
      payout_batch_id: payoutBatchId,
      results,
    });
  } catch (error) {
    console.error("paypalBuilderPayout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});