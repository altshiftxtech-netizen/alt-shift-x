import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// Public: capture a newsletter signup from the site popup.
// Creates an EmailSubscriber (audience "newsletter") with a unique unsubscribe
// token, or re-activates an existing record that had opted out. Idempotent.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, name, source, newsletter_opted_in, tool_downloaded, user_type } = await req.json();

    const clean = (email || "").toLowerCase().trim();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return Response.json({ error: "A valid email is required" }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.EmailSubscriber.filter({ email: clean });
    const token = crypto.randomUUID().replace(/-/g, "");
    // For free-tool gate captures, only keep them subscribed if they opted in.
    // The default popup flow (no flag passed) keeps the original behavior.
    const subscribed = newsletter_opted_in === false ? false : true;
    const src = source || "site_popup";

    if (existing && existing.length > 0) {
      const found = existing[0];
      await base44.asServiceRole.entities.EmailSubscriber.update(found.id, {
        // Never un-subscribe someone who already opted in; only upgrade to subscribed.
        subscribed: found.subscribed || subscribed,
        unsubscribed_at: (found.subscribed || subscribed) ? null : found.unsubscribed_at,
        name: name || found.name || "",
        unsubscribe_token: found.unsubscribe_token || token,
      });
      return Response.json({ ok: true, status: "reactivated" });
    }

    await base44.asServiceRole.entities.EmailSubscriber.create({
      email: clean,
      name: name || "",
      audience: "newsletter",
      source: src,
      subscribed,
      unsubscribe_token: token,
    });

    return Response.json({ ok: true, status: "created" });
  } catch (err) {
    console.error("[subscribeNewsletter] error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});