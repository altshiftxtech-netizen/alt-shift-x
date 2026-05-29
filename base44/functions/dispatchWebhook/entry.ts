/**
 * dispatchWebhook — fires platform events to all active subscriber endpoints.
 * Called internally by other functions: dispatchWebhook({ event_type, payload })
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

async function hmacSign(secret, body) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return "sha256=" + Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { event_type, payload, target_subscription_id } = await req.json();

    if (!event_type || !payload) {
      return Response.json({ error: "event_type and payload required" }, { status: 400 });
    }

    // Load active subscriptions — optionally target a single one (for debugger)
    let matching;
    if (target_subscription_id) {
      const subs = await base44.asServiceRole.entities.WebhookSubscription.filter({ id: target_subscription_id });
      matching = subs.filter(s => s.status === "active");
    } else {
      const allSubs = await base44.asServiceRole.entities.WebhookSubscription.filter({ status: "active" });
      matching = allSubs.filter(s => s.events && s.events.includes(event_type));
    }

    console.log(`Dispatching ${event_type} to ${matching.length} subscribers`);

    const envelope = {
      id: crypto.randomUUID(),
      event: event_type,
      created_at: new Date().toISOString(),
      data: payload,
    };
    const body = JSON.stringify(envelope);

    const results = await Promise.allSettled(
      matching.map(async (sub) => {
        const signature = sub.secret ? await hmacSign(sub.secret, body) : null;
        const headers = {
          "Content-Type": "application/json",
          "X-AltShiftX-Event": event_type,
          "X-AltShiftX-Delivery": envelope.id,
        };
        if (signature) headers["X-AltShiftX-Signature"] = signature;

        const res = await fetch(sub.endpoint_url, {
          method: "POST",
          headers,
          body,
          signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} from ${sub.endpoint_url}`);
        }

        // Update success stats
        await base44.asServiceRole.entities.WebhookSubscription.update(sub.id, {
          last_delivered_at: new Date().toISOString(),
          total_delivered: (sub.total_delivered || 0) + 1,
          failure_count: 0,
        });

        return { sub_id: sub.id, success: true };
      })
    );

    // Handle failures — auto-pause after 10 consecutive failures
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const sub = matching[i];
      if (result.status === "rejected") {
        const newFailureCount = (sub.failure_count || 0) + 1;
        console.error(`Webhook delivery failed for sub ${sub.id}: ${result.reason}`);
        await base44.asServiceRole.entities.WebhookSubscription.update(sub.id, {
          failure_count: newFailureCount,
          last_failure_reason: String(result.reason),
          status: newFailureCount >= 10 ? "failed" : "active",
        });
      }
    }

    const delivered = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    return Response.json({ dispatched: matching.length, delivered, failed, event_id: envelope.id });
  } catch (error) {
    console.error("dispatchWebhook error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});