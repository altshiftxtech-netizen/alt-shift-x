import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// ── PayPal LIVE webhook ───────────────────────────────────────────────────────
// Provisions subscriptions/component installs when a PayPal subscription is
// activated, and downgrades on cancel/suspend. Mirrors stripeWebhook provisioning.
// custom_id on the subscription carries base64(JSON) metadata: { user_id, plan, component_id?, component_name? }

const PAYPAL_API = "https://api-m.paypal.com"; // LIVE

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

// Verify the webhook came from PayPal using the official verify-webhook-signature API.
async function verifySignature(token, req, rawBody) {
  const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
  if (!webhookId) {
    console.warn("[paypalWebhook] PAYPAL_WEBHOOK_ID not set — skipping signature verification");
    return true;
  }
  const res = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_algo: req.headers.get("paypal-auth-algo"),
      cert_url: req.headers.get("paypal-cert-url"),
      transmission_id: req.headers.get("paypal-transmission-id"),
      transmission_sig: req.headers.get("paypal-transmission-sig"),
      transmission_time: req.headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  });
  const data = await res.json().catch(() => ({}));
  return data.verification_status === "SUCCESS";
}

function parseMeta(customId) {
  try { return JSON.parse(atob(customId || "")); } catch { return {}; }
}

Deno.serve(async (req) => {
  try {
    const rawBody = await req.text();
    const token = await paypalToken();

    const verified = await verifySignature(token, req, rawBody);
    if (!verified) {
      console.error("[paypalWebhook] Signature verification failed");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event_type;
    const eventId = event.id;
    const resource = event.resource || {};
    console.log(`[paypalWebhook] ${eventType} id=${eventId}`);

    const base44 = createClientFromRequest(req);

    // Idempotency — skip already-processed events
    const dup = await base44.asServiceRole.entities.ProcessedWebhookEvent.filter({ event_id: eventId });
    if (dup.length > 0) {
      console.log(`[paypalWebhook] Duplicate ${eventId} — skipping`);
      return Response.json({ received: true, duplicate: true });
    }

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const subscriptionId = resource.id;
        const meta = parseMeta(resource.custom_id);
        const userId = meta.user_id;
        const planKey = meta.plan;
        const componentId = meta.component_id;

        if (!userId) { console.warn("[paypalWebhook] No user_id in custom_id — skipping"); break; }

        const today = new Date().toISOString().split("T")[0];
        const nextMonth = new Date(); nextMonth.setMonth(nextMonth.getMonth() + 1);
        const periodEnd = nextMonth.toISOString().split("T")[0];

        // ── Builder subscription plan ──────────────────────────────────────────
        if (planKey && planKey !== "component") {
          const existing = await base44.asServiceRole.entities.Subscription.filter({ user_id: userId });
          const subData = {
            plan: planKey,
            status: "active",
            payment_provider: "paypal",
            paypal_subscription_id: subscriptionId,
            current_period_start: today,
            current_period_end: periodEnd,
            cancel_at_period_end: false,
            api_calls_used: 0,
          };
          if (existing.length > 0) {
            await base44.asServiceRole.entities.Subscription.update(existing[0].id, subData);
          } else {
            await base44.asServiceRole.entities.Subscription.create({ user_id: userId, ...subData });
          }
          console.log(`[paypalWebhook] Provisioned plan=${planKey} user=${userId}`);
        }

        // ── Marketplace component install ──────────────────────────────────────
        if (componentId) {
          const comps = await base44.asServiceRole.entities.Component.filter({ id: componentId });
          const compRecord = comps[0] || {};
          const alreadyInstalled = await base44.asServiceRole.entities.InstalledComponent.filter({
            user_id: userId, component_id: componentId,
          });
          if (alreadyInstalled.length === 0) {
            await base44.asServiceRole.entities.InstalledComponent.create({
              user_id: userId,
              component_id: componentId,
              component_name: meta.component_name || compRecord.name || "",
              component_code: compRecord.code || "",
              component_type: compRecord.type || "X2",
              trust_score: compRecord.trust_score || 0,
              paypal_subscription_id: subscriptionId,
              status: "active",
              installed_at: today,
            });
            if (comps.length > 0) {
              await base44.asServiceRole.entities.Component.update(componentId, {
                installs_count: (compRecord.installs_count || 0) + 1,
              });
            }
            console.log(`[paypalWebhook] Installed component=${componentId} user=${userId}`);
          }
        }

        // ── Affiliate purchase attribution ─────────────────────────────────────
        const attributions = await base44.asServiceRole.entities.AffiliateAttribution.filter({ user_id: userId });
        if (attributions.length > 0 && !attributions[0].purchased) {
          const attr = attributions[0];
          const cartAmount = componentId
            ? ((await base44.asServiceRole.entities.Component.filter({ id: componentId }))[0]?.price || 0)
            : ({ base_operator: 49, strategic_architect: 199, sovereign_commander: 599 }[planKey] || 0);
          await base44.asServiceRole.entities.AffiliateAttribution.update(attr.id, {
            purchased: true,
            purchase_type: componentId ? "marketplace" : "subscription",
            cart_amount: cartAmount,
            purchased_at: new Date().toISOString(),
          });
          const refLinks = await base44.asServiceRole.entities.AffiliateLink.filter({ code: attr.ref_code });
          if (refLinks.length > 0) {
            const rl = refLinks[0];
            await base44.asServiceRole.entities.AffiliateLink.update(rl.id, {
              paid_conversions: (rl.paid_conversions || 0) + 1,
              revenue_total: (rl.revenue_total || 0) + cartAmount,
            });
          }
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED":
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        const subscriptionId = resource.id;
        const existing = await base44.asServiceRole.entities.Subscription.filter({ paypal_subscription_id: subscriptionId });
        if (existing.length > 0) {
          // Builder plan → downgrade to free (preserve records)
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
            plan: "free",
            status: "cancelled",
            cancel_at_period_end: false,
          });
          console.log(`[paypalWebhook] Downgraded sub=${subscriptionId} to free`);
        }
        // Component installs via this subscription → cancelled
        const installed = await base44.asServiceRole.entities.InstalledComponent.filter({ paypal_subscription_id: subscriptionId });
        for (const inst of installed) {
          await base44.asServiceRole.entities.InstalledComponent.update(inst.id, { status: "cancelled" });
        }
        break;
      }

      default:
        console.log(`[paypalWebhook] Unhandled event: ${eventType}`);
    }

    await base44.asServiceRole.entities.ProcessedWebhookEvent.create({
      event_id: eventId,
      event_type: eventType,
      processed_at: new Date().toISOString(),
    }).catch((e) => console.error("[paypalWebhook] record processed failed:", e.message));

    return Response.json({ received: true, event_type: eventType });
  } catch (err) {
    console.error("[paypalWebhook]", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});