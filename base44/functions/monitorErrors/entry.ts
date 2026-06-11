import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * monitorErrors — platform-wide error watchdog.
 *
 * Scans for problem patterns and raises an alert when any single pattern has
 * occurred MORE THAN TWICE (occurrence_count > 2):
 *   - Automations with consecutive_failures > 2 (interrupted processes)
 *   - SecurityIncidents of type 403/unauthorized or 404-style suspicious paths
 *   - Any reported HTTP 403 / 404 logged into ErrorReport by other functions
 *
 * Authorization: admin user OR internal scheduled task carrying INTERNAL_TASK_SECRET.
 *
 * The function upserts ErrorReport records (deduped by error_key), then emails
 * every admin a digest of patterns that crossed the "more than twice" threshold.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Authorization: allow (a) the internal scheduled task carrying the secret,
    // (b) a scheduled/service invocation with no end-user context, or (c) an admin.
    // Block only authenticated non-admin end users.
    const internalSecret = Deno.env.get("INTERNAL_TASK_SECRET");
    const isInternalTask = !!internalSecret && body.task_secret === internalSecret;
    if (!isInternalTask) {
      const user = await base44.auth.me().catch(() => null);
      if (user && user.role !== "admin") {
        return Response.json({ error: "Admin only" }, { status: 403 });
      }
    }

    const now = new Date().toISOString();
    const sr = base44.asServiceRole;

    // ---- 1. Gather signals ----
    const [automations, incidents, existingReports] = await Promise.all([
      sr.entities.Automation?.list?.("-updated_date", 200).catch(() => []) ?? [],
      sr.entities.SecurityIncident.list("-created_date", 300).catch(() => []),
      sr.entities.ErrorReport.list("-last_seen", 500).catch(() => []),
    ]);

    const reportByKey = {};
    for (const r of existingReports) reportByKey[r.error_key] = r;

    // Build a map of observed signals: key -> { source, title, detail, status_code, severity, count }
    const observed = {};

    function observe(key, data, count) {
      if (!observed[key]) observed[key] = { error_key: key, count: 0, ...data };
      observed[key].count += count;
    }

    // 1a. Interrupted / failing automations (consecutive_failures > 2)
    for (const a of automations) {
      const fails = a.consecutive_failures || 0;
      if (fails > 0) {
        observe(`automation:${a.name}`, {
          source: "automation",
          title: `Automation failing: ${a.name}`,
          detail: `${a.function_name} has ${fails} consecutive failure(s). Last status: ${a.last_run_status}.`,
          status_code: null,
          severity: fails > 2 ? "high" : "medium",
        }, fails);
      }
    }

    // 1b. Security incidents — group 403/unauthorized and 404-style suspicious access
    for (const i of incidents) {
      const t = i.incident_type || "";
      let bucket = null;
      if (t === "unauthorized_access") bucket = "http:403";
      else if (t === "suspicious_pattern" || t === "bot_detected") bucket = "http:404";
      else if (t === "rate_limit_exceeded") bucket = "security:rate_limit";
      if (!bucket) continue;
      observe(bucket, {
        source: bucket.startsWith("http") ? "http" : "security",
        title: bucket === "http:403" ? "Repeated 403 / unauthorized access attempts"
          : bucket === "http:404" ? "Repeated 404 / suspicious path probing"
          : "Repeated rate-limit violations",
        detail: `Latest from IP ${i.ip_address || "unknown"} on ${i.request_path || "n/a"}.`,
        status_code: bucket === "http:403" ? 403 : bucket === "http:404" ? 404 : 429,
        severity: i.severity === "critical" ? "critical" : "high",
      }, 1);
    }

    // ---- 2. Upsert ErrorReport records ----
    for (const key of Object.keys(observed)) {
      const o = observed[key];
      const existing = reportByKey[key];
      if (existing) {
        const newCount = (existing.occurrence_count || 0) + o.count;
        await sr.entities.ErrorReport.update(existing.id, {
          occurrence_count: newCount,
          last_seen: now,
          severity: o.severity,
          detail: o.detail,
          resolved: false,
        });
        existing.occurrence_count = newCount;
      } else {
        const created = await sr.entities.ErrorReport.create({
          source: o.source,
          error_key: key,
          title: o.title,
          detail: o.detail,
          status_code: o.status_code,
          occurrence_count: o.count,
          severity: o.severity,
          first_seen: now,
          last_seen: now,
          alerted: false,
          resolved: false,
        });
        reportByKey[key] = created;
      }
    }

    // ---- 3. Find patterns crossing "more than twice" and not yet alerted ----
    const allReports = await sr.entities.ErrorReport.filter({ resolved: false }).catch(() => []);
    const toAlert = allReports.filter(r => (r.occurrence_count || 0) > 2 && !r.alerted);

    if (toAlert.length === 0) {
      console.log("[monitorErrors] No new error patterns over threshold.");
      return Response.json({ scanned: Object.keys(observed).length, alerted: 0 });
    }

    // ---- 4. Email all admins ----
    const admins = await sr.entities.User.filter({ role: "admin" }).catch(() => []);
    const lines = toAlert.map(r =>
      `• [${(r.severity || "medium").toUpperCase()}] ${r.title} — ${r.occurrence_count}× occurrences\n  ${r.detail || ""}`
    ).join("\n\n");

    const subject = `🚨 Platform Error Alert — ${toAlert.length} pattern(s) over threshold`;
    const emailBody = `
The error watchdog detected ${toAlert.length} issue pattern(s) that have occurred more than twice:

${lines}

Review them in the Security Center / Admin Panel.

---
Alt+Shift+X Platform Watchdog
    `.trim();

    let emailed = 0;
    for (const admin of admins) {
      if (!admin.email) continue;
      try {
        await sr.integrations.Core.SendEmail({
          to: admin.email,
          subject,
          body: emailBody,
          from_name: "Alt+Shift+X Watchdog",
        });
        emailed++;
      } catch (e) {
        console.error(`Failed to email admin ${admin.email}:`, e.message);
      }
    }

    // ---- 5. Mark as alerted ----
    for (const r of toAlert) {
      await sr.entities.ErrorReport.update(r.id, { alerted: true });
    }

    console.log(`[monitorErrors] Alerted ${emailed} admin(s) about ${toAlert.length} pattern(s).`);
    return Response.json({ scanned: Object.keys(observed).length, alerted: toAlert.length, admins_emailed: emailed });

  } catch (error) {
    console.error("monitorErrors error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});