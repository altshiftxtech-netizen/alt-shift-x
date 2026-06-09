import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

// Admin-only: send an email campaign to a chosen audience segment.
// Each email includes a working unsubscribe link so recipients can opt out.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

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

    await base44.asServiceRole.entities.EmailCampaign.update(campaignId, {
      status: "sending",
      recipient_count: recipients.length,
    });

    const origin = req.headers.get("origin") || `https://${Deno.env.get("BASE44_APP_ID")}.base44.app`;
    let sent = 0;
    let failed = 0;

    for (const r of recipients) {
      try {
        const unsubUrl = `${origin}/unsubscribe?token=${encodeURIComponent(r.unsubscribe_token || "")}&email=${encodeURIComponent(r.email)}`;
        const footer = `\n\n———\nYou're receiving this because you subscribed to Alt+Shift+X updates.\nUnsubscribe: ${unsubUrl}`;
        await base44.integrations.Core.SendEmail({
          to: r.email,
          subject: campaign.subject,
          body: `${campaign.body}${footer}`,
          from_name: campaign.created_by_name || "Alt+Shift+X",
        });
        sent++;
      } catch (e) {
        console.error(`[sendEmailCampaign] failed to ${r.email}:`, e.message);
        failed++;
      }
    }

    await base44.asServiceRole.entities.EmailCampaign.update(campaignId, {
      status: failed > 0 && sent === 0 ? "failed" : "sent",
      sent_count: sent,
      failed_count: failed,
      sent_at: new Date().toISOString(),
    });

    console.log(`[sendEmailCampaign] campaign=${campaignId} sent=${sent} failed=${failed}`);
    return Response.json({ ok: true, sent, failed, recipients: recipients.length });
  } catch (err) {
    console.error("[sendEmailCampaign] error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});