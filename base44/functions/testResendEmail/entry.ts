import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// Admin-only diagnostic: sends ONE test email via Resend and returns the raw
// Resend response so we can see exactly why campaign sends are failing.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "Alt+Shift+X <onboarding@resend.dev>";

    const { to } = await req.json();
    const recipient = to || user.email;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: recipient,
        subject: "Resend test from Alt+Shift+X",
        html: "<p>This is a test email to verify Resend delivery.</p>",
      }),
    });

    const status = res.status;
    const text = await res.text();
    console.log(`[testResendEmail] from="${FROM_EMAIL}" to=${recipient} status=${status} body=${text}`);

    return Response.json({
      ok: res.ok,
      status,
      from_used: FROM_EMAIL,
      to: recipient,
      resend_response: text,
    });
  } catch (err) {
    console.error("[testResendEmail] error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});