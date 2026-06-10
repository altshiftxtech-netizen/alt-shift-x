import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// Admin-only: send an email campaign to a chosen audience segment via Resend.
// Resend can deliver to any (imported) address, unlike Base44's built-in email
// which only sends to registered app users. Each email includes an unsubscribe link.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return Response.json({ error: "RESEND_API_KEY is not set" }, { status: 500 });
    }
    // Sending address: use your verified Resend domain. Falls back to Resend's
    // shared onboarding sender for testing if you haven't verified a domain yet.
    const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "Alt+Shift+X <onboarding@resend.dev>";

    const { campaignId } = await req.json();
    if (!campaignId) {
      return Response.json({ error: "Missing campaignId" }, { status: 400 });
    }

    const campaign = await base44.asServiceRole.entities.EmailCampaign.get(campaignId);
    if (!campaign) {
      return Response.json({ error: "Campaign not found" }, { status: 404 });
    }
    if (campaign.status === "sending" || campaign.status === "sent") {
      return Response.json({ error: "Campaign already sent or in progress" }, { status: 400 });
    }

    // Resolve recipients for the audience. "all_users" pulls everyone; the rest
    // pull from the EmailSubscriber list filtered by segment. Only subscribed.
    let subscribers = await base44.asServiceRole.entities.EmailSubscriber.filter({ subscribed: true });
    if (campaign.audience && campaign.audience !== "all_users") {
      subscribers = subscribers.filter((s) => s.audience === campaign.audience);
    }

    // De-dupe by email
    const seen = new Set();
    const recipients = subscribers.filter((s) => {
      const e = (s.email || "").toLowerCase().trim();
      if (!e || seen.has(e)) return false;
      seen.add(e);
      return true;
    });

    if (recipients.length === 0) {
      await base44.asServiceRole.entities.EmailCampaign.update(campaignId, {
        status: "failed", recipient_count: 0, sent_count: 0, failed_count: 0,
      });
      return Response.json({ ok: false, error: "No subscribers in this audience", sent: 0, failed: 0 }, { status: 200 });
    }

    await base44.asServiceRole.entities.EmailCampaign.update(campaignId, {
      status: "sending",
      recipient_count: recipients.length,
      open_count: 0,
    });

    const origin = req.headers.get("origin") || `https://${Deno.env.get("BASE44_APP_ID")}.base44.app`;
    const appId = Deno.env.get("BASE44_APP_ID");
    const escapeHtml = (s) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Build Resend attachment payloads by fetching each uploaded file once.
    const attachmentPayloads = [];
    for (const att of (campaign.attachments || [])) {
      try {
        const fileRes = await fetch(att.url);
        if (!fileRes.ok) { console.error(`[sendEmailCampaign] attachment fetch failed: ${att.name}`); continue; }
        const buf = new Uint8Array(await fileRes.arrayBuffer());
        let binary = "";
        for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
        attachmentPayloads.push({ filename: att.name, content: btoa(binary) });
      } catch (e) {
        console.error(`[sendEmailCampaign] attachment error ${att.name}:`, e.message);
      }
    }

    let sent = 0;
    let failed = 0;
    const errors = [];

    // Send one-by-one so each recipient gets a personalized unsubscribe link.
    // Resend rate limit is ~10 req/s on default plans; small delay keeps us safe.
    for (const r of recipients) {
      try {
        const unsubUrl = `${origin}/unsubscribe?token=${encodeURIComponent(r.unsubscribe_token || "")}&email=${encodeURIComponent(r.email)}`;
        const bodyHtml = escapeHtml(campaign.body).replace(/\n/g, "<br>");
        // Read-receipt tracking pixel — opening the email pings trackEmailOpen.
        const pixelUrl = `${origin}/functions/trackEmailOpen?c=${encodeURIComponent(campaignId)}`;
        const pixel = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none" />`;
        const html = `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">${bodyHtml}<hr style="margin:24px 0;border:none;border-top:1px solid #e5e5e5"><p style="font-size:12px;color:#888">You're receiving this because you subscribed to Alt+Shift+X updates.<br><a href="${unsubUrl}" style="color:#888">Unsubscribe</a></p>${pixel}</div>`;

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: r.email,
            subject: campaign.subject,
            html,
            ...(attachmentPayloads.length ? { attachments: attachmentPayloads } : {}),
          }),
        });

        if (res.ok) {
          sent++;
        } else {
          failed++;
          const errText = await res.text();
          if (errors.length < 3) errors.push(`${r.email}: ${errText.slice(0, 200)}`);
          console.error(`[sendEmailCampaign] Resend failed to ${r.email}: ${res.status} ${errText}`);
        }
      } catch (e) {
        failed++;
        if (errors.length < 3) errors.push(`${r.email}: ${e.message}`);
        console.error(`[sendEmailCampaign] failed to ${r.email}:`, e.message);
      }
      await new Promise((resolve) => setTimeout(resolve, 120));
    }

    await base44.asServiceRole.entities.EmailCampaign.update(campaignId, {
      status: failed > 0 && sent === 0 ? "failed" : "sent",
      sent_count: sent,
      failed_count: failed,
      sent_at: new Date().toISOString(),
    });

    console.log(`[sendEmailCampaign] campaign=${campaignId} sent=${sent} failed=${failed}`);
    return Response.json({ ok: sent > 0, sent, failed, recipients: recipients.length, errors });
  } catch (err) {
    console.error("[sendEmailCampaign] error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});