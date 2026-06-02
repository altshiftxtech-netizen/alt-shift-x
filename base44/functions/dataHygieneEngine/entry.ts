import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * dataHygieneEngine — weekly database cleanup autopilot.
 *
 *  1. Archive resolved/old SecurityIncidents (>90 days) → delete.
 *  2. Delete old resolved ErrorReports (>60 days).
 *  3. Delete old HealthCheckReports (keep last 90 days).
 *  4. Delete old ProcessedWebhookEvent rows (>30 days) — only idempotency markers.
 *  5. Auto-disable WebhookSubscriptions with high consecutive failures (if that field exists).
 *
 * Keeps the DB lean. Authorization: admin OR internal task secret.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const secret = Deno.env.get("INTERNAL_TASK_SECRET");
    const internal = !!secret && body.task_secret === secret;
    if (!internal) {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== "admin") return Response.json({ error: "Admin only" }, { status: 403 });
    }

    const sr = base44.asServiceRole;
    const now = new Date();
    const daysAgoIso = (d) => new Date(now.getTime() - d * 86400000).toISOString();
    const out = { incidents_purged: 0, errors_purged: 0, reports_purged: 0, webhook_events_purged: 0, webhooks_disabled: 0 };

    // 1. Old security incidents (>90 days)
    const incidents = await sr.entities.SecurityIncident.list("created_date", 1000).catch(() => []);
    for (const i of incidents) {
      if (i.created_date < daysAgoIso(90)) {
        await sr.entities.SecurityIncident.delete(i.id).catch(() => {});
        out.incidents_purged++;
      }
    }

    // 2. Old resolved error reports (>60 days)
    const errors = await sr.entities.ErrorReport.filter({ resolved: true }).catch(() => []);
    for (const e of errors) {
      if ((e.last_seen || e.created_date) < daysAgoIso(60)) {
        await sr.entities.ErrorReport.delete(e.id).catch(() => {});
        out.errors_purged++;
      }
    }

    // 3. Old health reports (>90 days)
    const reports = await sr.entities.HealthCheckReport.list("run_date", 1000).catch(() => []);
    for (const r of reports) {
      if ((r.run_date || r.created_date) < daysAgoIso(90)) {
        await sr.entities.HealthCheckReport.delete(r.id).catch(() => {});
        out.reports_purged++;
      }
    }

    // 4. Old processed webhook idempotency markers (>30 days)
    const events = await sr.entities.ProcessedWebhookEvent.list("created_date", 2000).catch(() => []);
    for (const ev of events) {
      if (ev.created_date < daysAgoIso(30)) {
        await sr.entities.ProcessedWebhookEvent.delete(ev.id).catch(() => {});
        out.webhook_events_purged++;
      }
    }

    // 5. Auto-disable repeatedly failing webhook subscriptions
    const webhooks = await sr.entities.WebhookSubscription?.list?.("-created_date", 500).catch(() => []) ?? [];
    for (const w of webhooks) {
      if ((w.consecutive_failures || 0) >= 10 && w.active !== false) {
        await sr.entities.WebhookSubscription.update(w.id, { active: false }).catch(() => {});
        out.webhooks_disabled++;
      }
    }

    console.log("[dataHygieneEngine]", JSON.stringify(out));
    return Response.json({ success: true, ...out });
  } catch (error) {
    console.error("dataHygieneEngine error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});