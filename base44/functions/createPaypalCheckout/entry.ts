import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// ── PayPal LIVE integration ───────────────────────────────────────────────────
// Creates a PayPal subscription (recurring) for either a builder plan or a
// marketplace component, mirroring createCheckoutSession (Stripe). Returns the
// PayPal approval URL the buyer is redirected to. Provisioning happens in
// paypalWebhook on BILLING.SUBSCRIPTION.ACTIVATED.

const PAYPAL_LIVE = "https://api-m.paypal.com";
const PAYPAL_SANDBOX = "https://api-m.sandbox.paypal.com";

// Builder subscription plan → monthly price (USD) + display name
const BUILDER_PLANS = {
  base_operator: { name: "Base Operator", price: 49 },
  strategic_architect: { name: "Strategic Architect", price: 199 },
  sovereign_commander: { name: "Sovereign Commander", price: 599 },
};

async function paypalToken(api, testMode) {
  const id = testMode ? Deno.env.get("PAYPAL_SANDBOX_CLIENT_ID") : Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = testMode ? Deno.env.get("PAYPAL_SANDBOX_SECRET") : Deno.env.get("PAYPAL_SECRET");
  const auth = btoa(`${id}:${secret}`);
  const res = await fetch(`${api}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function pp(api, token, path, body) {
  const res = await fetch(`${api}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`PayPal ${path} failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

// Create a PayPal catalog product + monthly billing plan, return the plan id.
async function ensurePlan(api, token, { name, price, refId }) {
  const product = await pp(api, token, "/v1/catalogs/products", {
    name,
    type: "SERVICE",
    category: "SOFTWARE",
  });

  const plan = await pp(api, token, "/v1/billing/plans", {
    product_id: product.id,
    name: `${name} — Monthly`,
    billing_cycles: [
      {
        frequency: { interval_unit: "MONTH", interval_count: 1 },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0, // infinite
        pricing_scheme: {
          fixed_price: { value: price.toFixed(2), currency_code: "USD" },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: "CONTINUE",
      payment_failure_threshold: 3,
    },
  });

  return plan.id;
}

// Rate limit: max 8 checkout attempts per IP per minute
const rlAttempts = new Map();
const RL_WINDOW = 60_000;
const RL_MAX = 8;
function rlCheck(req) {
  const fwd = req.headers.get("x-forwarded-for") || "";
  const ip = (req.headers.get("cf-connecting-ip") || fwd.split(",")[0] || "unknown").trim();
  const now = Date.now();
  const recent = (rlAttempts.get(ip) || []).filter((t) => now - t < RL_WINDOW);
  if (recent.length >= RL_MAX) return false;
  recent.push(now);
  rlAttempts.set(ip, recent);
  return true;
}

Deno.serve(async (req) => {
  try {
    if (!rlCheck(req)) {
      return Response.json({ error: "Too many checkout attempts. Please wait a moment." }, { status: 429 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { planKey, componentId } = body;
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "https://app.altshiftx.com";

    // ── Admin-controlled TEST mode → PayPal Sandbox ──────────────────────────
    const modeRows = await base44.asServiceRole.entities.PaymentMode.list("-updated_date", 1);
    const testMode = modeRows.length > 0 && modeRows[0].test_mode === true;
    const api = testMode ? PAYPAL_SANDBOX : PAYPAL_LIVE;
    if (testMode) console.log("[createPaypalCheckout] TEST MODE active — using PayPal Sandbox");

    const token = await paypalToken(api, testMode);

    let planId, metadata, returnPath;

    // ── Route A: Marketplace component ──────────────────────────────────────────
    if (componentId) {
      const components = await base44.entities.Component.filter({ id: componentId });
      if (!components.length) return Response.json({ error: "Component not found" }, { status: 404 });
      const component = components[0];

      // In test mode always mint an ephemeral sandbox plan — never reuse/overwrite
      // the stored live paypal_plan_id.
      let planIdStored = testMode ? null : component.paypal_plan_id;
      if (!planIdStored) {
        planIdStored = await ensurePlan(api, token, {
          name: component.name,
          price: component.price || 49,
          refId: component.id,
        });
        if (!testMode) {
          await base44.asServiceRole.entities.Component.update(component.id, { paypal_plan_id: planIdStored });
        }
      }
      planId = planIdStored;
      returnPath = `/success/install?paypal=1&component=${encodeURIComponent(component.name)}&id=${component.id}`;
      metadata = { user_id: user.id, component_id: component.id, component_name: component.name, plan: "component" };
    }
    // ── Route B: Builder subscription plan ──────────────────────────────────────
    else if (planKey) {
      const plan = BUILDER_PLANS[planKey];
      if (!plan) return Response.json({ error: "Invalid plan" }, { status: 400 });
      planId = await ensurePlan(api, token, { name: plan.name, price: plan.price, refId: planKey });
      returnPath = `/success/subscription?subscribed=true&paypal=1&plan=${planKey}`;
      metadata = { user_id: user.id, plan: planKey };
    } else {
      return Response.json({ error: "Provide either componentId or planKey" }, { status: 400 });
    }

    // custom_id carries our metadata back through the webhook (max 127 chars).
    const customId = btoa(JSON.stringify(metadata)).slice(0, 127);

    const sub = await pp(api, token, "/v1/billing/subscriptions", {
      plan_id: planId,
      custom_id: customId,
      subscriber: { email_address: user.email },
      application_context: {
        brand_name: "Alt+Shift+X",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${origin}${returnPath}`,
        cancel_url: `${origin}${componentId ? `/marketplace/${componentId}` : "/pricing"}`,
      },
    });

    const approveLink = (sub.links || []).find((l) => l.rel === "approve");
    if (!approveLink) throw new Error("No approval link returned by PayPal");

    console.log(`[createPaypalCheckout] subscription=${sub.id} user=${user.id} ${planKey || componentId}`);
    return Response.json({ url: approveLink.href });
  } catch (error) {
    console.error("[createPaypalCheckout]", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});