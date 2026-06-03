import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// One-time admin utility: seeds the 20 Vested100 Beta campaign affiliate links.
// Idempotent — skips any code that already exists.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const LINKS = [
      { code: "vested100-tw01", label: "Twitter/X Post #1", destination: "pricing" },
      { code: "vested100-tw02", label: "Twitter/X Post #2", destination: "pricing" },
      { code: "vested100-tw03", label: "Twitter/X Post #3", destination: "home" },
      { code: "vested100-li01", label: "LinkedIn Post #1", destination: "pricing" },
      { code: "vested100-li02", label: "LinkedIn Post #2", destination: "home" },
      { code: "vested100-li03", label: "LinkedIn DM Outreach", destination: "pricing" },
      { code: "vested100-em01", label: "Email Blast #1", destination: "pricing" },
      { code: "vested100-em02", label: "Email Newsletter", destination: "home" },
      { code: "vested100-em03", label: "Cold Email Sequence", destination: "pricing" },
      { code: "vested100-rd01", label: "Reddit r/construction", destination: "home" },
      { code: "vested100-rd02", label: "Reddit r/SaaS", destination: "pricing" },
      { code: "vested100-dc01", label: "Discord Community", destination: "marketplace" },
      { code: "vested100-yt01", label: "YouTube Demo Video", destination: "marketplace" },
      { code: "vested100-ph01", label: "Product Hunt Launch", destination: "home" },
      { code: "vested100-pc01", label: "Podcast Sponsorship", destination: "home" },
      { code: "vested100-bg01", label: "Blog / Guest Post", destination: "marketplace" },
      { code: "vested100-pr01", label: "Partner Referral #1", destination: "pricing" },
      { code: "vested100-pr02", label: "Partner Referral #2", destination: "pricing" },
      { code: "vested100-cf01", label: "Conference / Event", destination: "home" },
      { code: "vested100-ig01", label: "Instagram Bio Link", destination: "marketplace" },
    ];

    let created = 0;
    let skipped = 0;
    for (const l of LINKS) {
      const existing = await base44.asServiceRole.entities.AffiliateLink.filter({ code: l.code });
      if (existing.length > 0) { skipped++; continue; }
      await base44.asServiceRole.entities.AffiliateLink.create({
        code: l.code,
        campaign: "Vested100 Beta",
        label: l.label,
        destination: l.destination,
        owner_id: user.id,
        owner_name: user.full_name || "Admin",
        clicks: 0, signups: 0, paid_conversions: 0, revenue_total: 0, active: true,
      });
      created++;
    }

    console.log(`[seedVested100Links] created=${created}, skipped=${skipped}`);
    return Response.json({ ok: true, created, skipped });
  } catch (err) {
    console.error("[seedVested100Links] error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});