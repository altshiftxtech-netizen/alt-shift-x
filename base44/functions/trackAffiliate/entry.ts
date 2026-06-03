import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// Tracks affiliate link activity: clicks, signups, and purchase attribution.
// Public app — visitors may be unauthenticated, so all writes use the service role.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, code, user_id, user_email, user_name } = await req.json();

    if (!code) {
      return Response.json({ error: "Missing code" }, { status: 400 });
    }

    const links = await base44.asServiceRole.entities.AffiliateLink.filter({ code });
    if (links.length === 0) {
      return Response.json({ ok: false, reason: "unknown_code" });
    }
    const link = links[0];

    // ── Click ──────────────────────────────────────────────────────────────
    if (action === "click") {
      await base44.asServiceRole.entities.AffiliateLink.update(link.id, {
        clicks: (link.clicks || 0) + 1,
      });
      return Response.json({ ok: true });
    }

    // ── Signup attribution ───────────────────────────────────────────────────
    if (action === "signup") {
      if (!user_id) return Response.json({ error: "Missing user_id" }, { status: 400 });

      // Idempotent: don't double-attribute the same user
      const existing = await base44.asServiceRole.entities.AffiliateAttribution.filter({ user_id });
      if (existing.length > 0) {
        return Response.json({ ok: true, duplicate: true });
      }

      await base44.asServiceRole.entities.AffiliateAttribution.create({
        ref_code: code,
        campaign: link.campaign || "",
        user_id,
        user_email: user_email || "",
        user_name: user_name || "",
        signed_up_at: new Date().toISOString(),
        purchased: false,
        purchase_type: "none",
        cart_amount: 0,
      });

      await base44.asServiceRole.entities.AffiliateLink.update(link.id, {
        signups: (link.signups || 0) + 1,
      });

      console.log(`[trackAffiliate] Signup attributed: code=${code}, user=${user_id}`);
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[trackAffiliate] error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});