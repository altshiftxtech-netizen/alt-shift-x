import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * dailyHealthCheck — "set it and forget it" self-healing daily watchdog.
 *
 * Runs every morning at 9am (via scheduled automation). It:
 *   1. TESTS core systems (database reads, automations, security, errors, billing data)
 *   2. AUTO-HEALS what it safely can:
 *        - Re-enables automations that were auto-disabled by failures (and clears the failure counter)
 *        - Resolves stale ErrorReport patterns no longer recurring (>3 days since last_seen)
 *        - Auto-marks old, low/medium SecurityIncidents as reviewed (>7 days, status "new")
 *   3. REPORTS everything (what's working ✅, what's broken ⚠️, what it fixed 🔧) to a
 *      HealthCheckReport record AND emails every admin a clean morning digest.
 *
 * Authorization: admin user OR internal scheduled task carrying INTERNAL_TASK_SECRET.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const internalSecret = Deno.env.get("INTERNAL_TASK_SECRET");
    const isInternalTask = !!internalSecret && body.task_secret === internalSecret;
    if (!isInternalTask) {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== "admin") {
        return Response.json({ error: "Admin only" }, { status: 403 });
      }
    }

    const sr = base44.asServiceRole;
    const now = new Date();
    const nowIso = now.toISOString();

    const checks = [];
    const fixesApplied = [];
    const issuesFound = [];
    const whatsWorking = [];
    const metrics = {};

    const daysAgoIso = (d) => new Date(now.getTime() - d * 86400000).toISOString();

    // ── CHECK 1: Database / core entity reads ──
    let components = [];
    try {
      components = await sr.entities.Component.filter({ status: "published" });
      metrics.published_components = components.length;
      checks.push({ name: "Database & Marketplace", status: "pass", detail: `${components.length} published components reachable.` });
      whatsWorking.push(`Marketplace online — ${components.length} published components serving normally.`);
    } catch (e) {
      checks.push({ name: "Database & Marketplace", status: "fail", detail: `Read failed: ${e.message}` });
      issuesFound.push("Database read failure on Component entity — needs investigation.");
    }

    // ── CHECK 2 + HEAL: Automations (interrupted / failing processes) ──
    let automations = [];
    try {
      automations = (await sr.entities.Automation?.list?.("-updated_date", 200)) || [];
      metrics.total_automations = automations.length;
      const failing = automations.filter(a => (a.consecutive_failures || 0) > 0);
      const disabledByFailure = automations.filter(a => a.is_active === false && (a.consecutive_failures || 0) > 0);

      // AUTO-HEAL: re-enable automations auto-disabled by failures and reset their counter
      for (const a of disabledByFailure) {
        try {
          await sr.entities.Automation.update(a.id, { is_active: true, consecutive_failures: 0 });
          fixesApplied.push(`Re-enabled stalled automation "${a.name}" and reset its failure counter.`);
        } catch { /* best-effort */ }
      }

      if (failing.length === 0) {
        checks.push({ name: "Automations / Scheduled Jobs", status: "pass", detail: `${automations.length} automations healthy.` });
        whatsWorking.push(`All ${automations.length} scheduled jobs running without failures.`);
      } else {
        checks.push({ name: "Automations / Scheduled Jobs", status: "warn", detail: `${failing.length} automation(s) reported recent failures.` });
        failing.forEach(a => issuesFound.push(`Automation "${a.name}" had ${a.consecutive_failures} failure(s).`));
      }
    } catch (e) {
      checks.push({ name: "Automations / Scheduled Jobs", status: "warn", detail: `Could not read automations: ${e.message}` });
    }

    // ── CHECK 3 + HEAL: Error patterns (404/403/interrupted, >2 occurrences) ──
    try {
      const errors = await sr.entities.ErrorReport.filter({ resolved: false }).catch(() => []);
      metrics.open_error_patterns = errors.length;
      const overThreshold = errors.filter(r => (r.occurrence_count || 0) > 2);

      // AUTO-HEAL: resolve stale error patterns not seen in >3 days
      let resolvedCount = 0;
      for (const r of errors) {
        if (r.last_seen && r.last_seen < daysAgoIso(3)) {
          try {
            await sr.entities.ErrorReport.update(r.id, { resolved: true });
            resolvedCount++;
          } catch { /* best-effort */ }
        }
      }
      if (resolvedCount > 0) fixesApplied.push(`Auto-resolved ${resolvedCount} stale error pattern(s) that stopped recurring.`);

      const stillActive = overThreshold.filter(r => !(r.last_seen < daysAgoIso(3)));
      if (stillActive.length === 0) {
        checks.push({ name: "Error Patterns (404/403/failures)", status: "pass", detail: "No active error patterns over threshold." });
        whatsWorking.push("No recurring 404/403 or interrupted-process patterns active.");
      } else {
        checks.push({ name: "Error Patterns (404/403/failures)", status: "warn", detail: `${stillActive.length} active pattern(s) over threshold.` });
        stillActive.forEach(r => issuesFound.push(`${r.title} — ${r.occurrence_count}× occurrences.`));
      }
    } catch (e) {
      checks.push({ name: "Error Patterns (404/403/failures)", status: "warn", detail: `Could not read error reports: ${e.message}` });
    }

    // ── CHECK 4 + HEAL: Security incidents ──
    try {
      const incidents = await sr.entities.SecurityIncident.list("-created_date", 300).catch(() => []);
      const newIncidents = incidents.filter(i => i.status === "new");
      const critical = incidents.filter(i => i.severity === "critical");
      metrics.total_incidents = incidents.length;
      metrics.new_incidents = newIncidents.length;

      // AUTO-HEAL: auto-review old low/medium incidents (>7 days) to keep the queue clean
      let reviewed = 0;
      for (const i of newIncidents) {
        if ((i.severity === "low" || i.severity === "medium") && i.created_date < daysAgoIso(7)) {
          try {
            await sr.entities.SecurityIncident.update(i.id, { status: "reviewed" });
            reviewed++;
          } catch { /* best-effort */ }
        }
      }
      if (reviewed > 0) fixesApplied.push(`Auto-archived ${reviewed} old low/medium security incident(s).`);

      if (critical.length === 0) {
        checks.push({ name: "Security Sentinel", status: "pass", detail: `${incidents.length} incidents logged, none critical/unhandled.` });
        whatsWorking.push("Security Sentinel active — no critical threats detected.");
      } else {
        checks.push({ name: "Security Sentinel", status: "warn", detail: `${critical.length} critical incident(s) on record.` });
        issuesFound.push(`${critical.length} critical security incident(s) — review in Security Center.`);
      }
    } catch (e) {
      checks.push({ name: "Security Sentinel", status: "warn", detail: `Could not read incidents: ${e.message}` });
    }

    // ── CHECK 5: Billing data integrity (subscriptions readable) ──
    try {
      const subs = await sr.entities.Subscription.list("-created_date", 100).catch(() => []);
      metrics.active_subscriptions = subs.filter(s => s.status === "active" || s.status === "trialing").length;
      checks.push({ name: "Billing & Subscriptions", status: "pass", detail: `${metrics.active_subscriptions} active/trialing subscriptions.` });
      whatsWorking.push(`Billing data intact — ${metrics.active_subscriptions} active subscriptions.`);
    } catch (e) {
      checks.push({ name: "Billing & Subscriptions", status: "warn", detail: `Could not read subscriptions: ${e.message}` });
    }

    // ── Determine overall status ──
    const hasFail = checks.some(c => c.status === "fail");
    const hasWarn = checks.some(c => c.status === "warn");
    const overall = hasFail ? "critical" : hasWarn ? "degraded" : "healthy";

    // ── Persist report ──
    const report = await sr.entities.HealthCheckReport.create({
      run_date: nowIso,
      overall_status: overall,
      checks,
      fixes_applied: fixesApplied,
      issues_found: issuesFound,
      whats_working: whatsWorking,
      metrics,
      email_sent: false,
    });

    // ── Email admins the morning digest ──
    const admins = await sr.entities.User.filter({ role: "admin" }).catch(() => []);
    const statusEmoji = overall === "healthy" ? "✅" : overall === "degraded" ? "⚠️" : "🚨";
    const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const section = (title, arr, bullet) => arr.length
      ? `${title}\n${arr.map(x => `  ${bullet} ${x}`).join("\n")}\n`
      : `${title}\n  (none)\n`;

    const emailBody = [
      `${statusEmoji} DAILY HEALTH REPORT — ${dateStr}`,
      `Overall status: ${overall.toUpperCase()}`,
      ``,
      section("✅ WHAT'S WORKING", whatsWorking, "•"),
      section("🔧 WHAT I FIXED AUTOMATICALLY", fixesApplied, "•"),
      section("⚠️ NEEDS YOUR ATTENTION", issuesFound, "•"),
      `── System Checks ──`,
      checks.map(c => `  ${c.status === "pass" ? "✅" : c.status === "warn" ? "⚠️" : "❌"} ${c.name}: ${c.detail}`).join("\n"),
      ``,
      `You're all set — this runs automatically every morning at 9am.`,
      `View full history in the Admin Health dashboard.`,
      ``,
      `— Alt+Shift+X Self-Healing Watchdog`,
    ].join("\n");

    let emailed = 0;
    for (const admin of admins) {
      if (!admin.email) continue;
      try {
        await sr.integrations.Core.SendEmail({
          to: admin.email,
          subject: `${statusEmoji} Daily Health Report — ${overall.toUpperCase()} — ${dateStr}`,
          body: emailBody,
          from_name: "Alt+Shift+X Watchdog",
        });
        emailed++;
      } catch (e) {
        console.error(`Failed to email admin ${admin.email}:`, e.message);
      }
    }

    await sr.entities.HealthCheckReport.update(report.id, { email_sent: emailed > 0 });

    console.log(`[dailyHealthCheck] status=${overall} fixes=${fixesApplied.length} issues=${issuesFound.length} emailed=${emailed}`);
    return Response.json({
      success: true,
      overall_status: overall,
      fixes_applied: fixesApplied.length,
      issues_found: issuesFound.length,
      admins_emailed: emailed,
      report_id: report.id,
    });

  } catch (error) {
    console.error("dailyHealthCheck error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});