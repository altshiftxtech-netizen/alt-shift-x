import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// Public: opt a recipient out using their unsubscribe token (no login needed).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token, email } = await req.json();

    if (!token && !email) {
      return Response.json({ error: "Missing token or email" }, { status: 400 });
    }

    let matches = [];
    if (token) {
      matches = await base44.asServiceRole.entities.EmailSubscriber.filter({ unsubscribe_token: token });
    }
    if (matches.length === 0 && email) {
      matches = await base44.asServiceRole.entities.EmailSubscriber.filter({ email: email.toLowerCase().trim() });
    }

    if (matches.length === 0) {
      // Don't reveal whether the email exists — just acknowledge.
      return Response.json({ ok: true });
    }

    for (const m of matches) {
      await base44.asServiceRole.entities.EmailSubscriber.update(m.id, {
        subscribed: false,
        unsubscribed_at: new Date().toISOString(),
      });
    }

    console.log(`[unsubscribeEmail] opted out ${matches.length} record(s)`);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[unsubscribeEmail] error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});