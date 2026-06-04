// TEMPORARY diagnostic — checks which PayPal environment the stored credentials
// authenticate against (Live vs Sandbox). Delete after diagnosis.
Deno.serve(async () => {
  const id = Deno.env.get("PAYPAL_CLIENT_ID") || "";
  const secret = Deno.env.get("PAYPAL_SECRET") || "";
  const auth = btoa(`${id}:${secret}`);

  async function tryEnv(label, base) {
    try {
      const res = await fetch(`${base}/v1/oauth2/token`, {
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=client_credentials",
      });
      return { label, status: res.status, ok: res.ok };
    } catch (e) {
      return { label, error: e.message };
    }
  }

  const live = await tryEnv("LIVE", "https://api-m.paypal.com");
  const sandbox = await tryEnv("SANDBOX", "https://api-m.sandbox.paypal.com");

  return Response.json({
    client_id_length: id.length,
    secret_length: secret.length,
    client_id_prefix: id.slice(0, 6),
    secret_prefix: secret.slice(0, 4),
    live,
    sandbox,
  });
});