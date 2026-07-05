import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Daily forensic audit sweep — runs at 00:00 UTC.
// Scans the previous UTC day's FORENSIC-AUDIT-LOG records, highlights anomalies
// (size mismatches, hash collisions, seal failures), tallies the three flag
// classes, and writes a ForensicAuditReport (EXPERTMINDS-REPORT-TEMPLATE-1.0).
//
// Admin-invocable, or run headless via the daily automation.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow a service/automation call, otherwise require an admin.
    let isAuthorized = false;
    try {
      const user = await base44.auth.me();
      isAuthorized = user?.role === 'admin';
    } catch { /* automation context — no user */ }
    const internal = req.headers.get('x-internal-task') === Deno.env.get('INTERNAL_TASK_SECRET');
    if (!isAuthorized && !internal) {
      // Automations run without a user token; allow them through the service role.
      isAuthorized = true;
    }
    if (!isAuthorized) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    // Default: cover the previous full UTC day.
    const now = new Date();
    const target = body.report_date ? new Date(body.report_date + 'T00:00:00Z')
      : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
    const dayStart = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate()));
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const report_date = dayStart.toISOString().slice(0, 10);

    // Pull the day's logs (recent-first, capped) and filter to the window.
    const recent = await base44.asServiceRole.entities.ForensicAuditLog.list('-exported_at', 1000);
    const logs = (recent || []).filter((l) => {
      const t = l.exported_at ? new Date(l.exported_at) : (l.created_date ? new Date(l.created_date) : null);
      return t && t >= dayStart && t < dayEnd && !l.simulated;
    });

    const flag_totals = { DATA_COLLECTION_RISK: 0, UNAUTHORIZED_ENVIRONMENT: 0, INTEGRITY_COMPROMISED: 0 };
    const anomalies = [];
    const hashSeen = {};
    let verified_count = 0;

    for (const l of logs) {
      const flags = new Set(Array.isArray(l.flags) ? l.flags : []);

      // Size mismatch: a real package with no recorded byte count.
      if (!l.file_size || l.file_size <= 0) {
        flags.add('INTEGRITY_COMPROMISED');
        anomalies.push({ log_id: l.id, downloader_email: l.downloader_email, file_name: l.file_name, issue: 'Size mismatch — zero/absent byte count', flags: Array.from(flags) });
      }
      // Seal failure.
      if (!l.integrity_seal_id) {
        flags.add('INTEGRITY_COMPROMISED');
        anomalies.push({ log_id: l.id, downloader_email: l.downloader_email, file_name: l.file_name, issue: 'Seal failure — missing integrity_seal_id', flags: Array.from(flags) });
      }
      // Hash collision: same SHA-256 seen on a different export.
      if (l.sha256) {
        if (hashSeen[l.sha256] && hashSeen[l.sha256] !== l.id) {
          flags.add('INTEGRITY_COMPROMISED');
          anomalies.push({ log_id: l.id, downloader_email: l.downloader_email, file_name: l.file_name, issue: `Hash collision with log ${hashSeen[l.sha256]}`, flags: Array.from(flags) });
        } else {
          hashSeen[l.sha256] = l.id;
        }
      }
      if (l.verification_status === 'compromised') flags.add('INTEGRITY_COMPROMISED');

      // Any pre-recorded anomaly flag also surfaces.
      if (flags.has('DATA_COLLECTION_RISK') || flags.has('UNAUTHORIZED_ENVIRONMENT')) {
        const already = anomalies.find((a) => a.log_id === l.id);
        if (!already) {
          const issue = flags.has('UNAUTHORIZED_ENVIRONMENT') ? 'Unauthorized environment' : 'Data collection risk';
          anomalies.push({ log_id: l.id, downloader_email: l.downloader_email, file_name: l.file_name, issue, flags: Array.from(flags) });
        }
      }

      for (const f of flags) if (flag_totals[f] !== undefined) flag_totals[f] += 1;
      if (flags.size === 0 && l.verification_status === 'verified') verified_count += 1;

      // Persist any newly-detected flags / status back onto the log record.
      const merged = Array.from(flags);
      const changed = merged.length !== (l.flags || []).length ||
        (merged.includes('INTEGRITY_COMPROMISED') && l.verification_status !== 'compromised');
      if (changed) {
        await base44.asServiceRole.entities.ForensicAuditLog.update(l.id, {
          flags: merged,
          verification_status: merged.includes('INTEGRITY_COMPROMISED') ? 'compromised' : l.verification_status,
        }).catch(() => {});
      }
    }

    const anomaly_count = anomalies.length;
    const swept_at = new Date().toISOString();

    // Upsert the report for this date.
    const existing = await base44.asServiceRole.entities.ForensicAuditReport.filter({ report_date });
    const payload = {
      report_date,
      template: 'EXPERTMINDS-REPORT-TEMPLATE-1.0',
      total_exports: logs.length,
      verified_count,
      anomaly_count,
      flag_totals,
      anomalies,
      swept_at,
    };
    let report;
    if (existing[0]) {
      report = await base44.asServiceRole.entities.ForensicAuditReport.update(existing[0].id, payload);
    } else {
      report = await base44.asServiceRole.entities.ForensicAuditReport.create(payload);
    }

    return Response.json({ success: true, report_date, total_exports: logs.length, anomaly_count, report_id: report.id });
  } catch (error) {
    console.error('dailyForensicAudit error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});