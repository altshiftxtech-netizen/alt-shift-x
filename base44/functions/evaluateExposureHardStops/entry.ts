import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// SOVEREIGN-EXPOSURE-HARDSTOP-1.0
// Evaluates a high-stakes session against the four Exposure Hard-Stops.
// If any rule is breached, the session is "Bit-Stamped and Purged":
//   1. A SHA-256 forensic bit-stamp locks the logic-state into the Truth Anchor.
//   2. An ExposureHardStop record is created (immutable audit trail).
//   3. The caller is instructed to purge the session buffer and start fresh.
//
// Rules:
//   1. Value-Density Threshold  — arr_value >= $100,000,000
//   2. Strategic Boundary Gate  — phase === "mixed" (Production + External Outreach)
//   3. Context Saturation       — context_pct >= 60 OR typing_lag === true
//   4. Temporal Hard-Stop       — session_duration_minutes >= 240 (4h)

const RULES = [
  {
    rule_code: 'VALUE_DENSITY_100M',
    rule_name: 'Value-Density Threshold (The $100M Rule)',
    threshold: '$100M ARR generated or updated per session',
    check: (t) => typeof t.arr_value === 'number' && t.arr_value >= 100_000_000,
    describe: (t) => t.arr_value != null
      ? `$${(t.arr_value / 1_000_000).toFixed(1)}M ARR`
      : null,
  },
  {
    rule_code: 'PROMETHEUS_GATE',
    rule_name: 'Strategic Boundary Gate (The Prometheus Gate)',
    threshold: 'No mixing Production logic with External Outreach in one context window',
    check: (t) => t.phase === 'mixed',
    describe: (t) => t.phase ? `phase: ${t.phase}` : null,
  },
  {
    rule_code: 'CONTEXT_SATURATION_60',
    rule_name: 'Context Saturation (The 60% Rule)',
    threshold: '60% of token window or noticeable typing lag',
    check: (t) => (typeof t.context_pct === 'number' && t.context_pct >= 60) || !!t.typing_lag,
    describe: (t) => {
      const parts = [];
      if (t.context_pct != null) parts.push(`${t.context_pct}% context`);
      if (t.typing_lag) parts.push('typing lag');
      return parts.length ? parts.join(' + ') : null;
    },
  },
  {
    rule_code: 'TEMPORAL_4H',
    rule_name: 'Temporal Hard-Stop (The 4-Hour Standard)',
    threshold: '4 hours per high-stakes session',
    check: (t) => typeof t.session_duration_minutes === 'number' && t.session_duration_minutes >= 240,
    describe: (t) => {
      if (t.session_duration_minutes == null) return null;
      const h = Math.floor(t.session_duration_minutes / 60);
      const m = Math.round(t.session_duration_minutes % 60);
      return `${h}h ${m}m`;
    },
  },
];

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const {
      session_id,
      arr_value,
      phase,
      context_pct,
      typing_lag,
      session_duration_minutes,
      notes,
    } = body;

    if (!session_id) {
      return Response.json({ error: 'session_id is required' }, { status: 400 });
    }

    const telemetry = { arr_value, phase, context_pct, typing_lag, session_duration_minutes };

    // Evaluate every rule against the session telemetry.
    const evaluations = RULES.map((r) => ({
      rule_code: r.rule_code,
      rule_name: r.rule_name,
      threshold: r.threshold,
      breached: r.check(telemetry),
      trigger_value: r.describe(telemetry),
    }));

    const triggered = evaluations.filter((e) => e.breached);

    // No breach → return a clean bill of health (no record written).
    if (triggered.length === 0) {
      return Response.json({
        protocol: 'SOVEREIGN-EXPOSURE-HARDSTOP-1.0',
        session_id,
        bit_stamped_and_purged: false,
        evaluations,
        message: 'Session is within all Exposure Hard-Stop thresholds. No purge required.',
      });
    }

    // One or more rules breached → Bit-Stamp and Purge each.
    const nowIso = new Date().toISOString();
    const records = [];
    for (const t of triggered) {
      const stampPayload = JSON.stringify({
        session_id,
        rule: t.rule_code,
        owner_id: user.id,
        ts: nowIso,
      });
      const bit_stamp_hash = await sha256(stampPayload);
      const rec = await base44.asServiceRole.entities.ExposureHardStop.create({
        owner_id: user.id,
        session_id,
        protocol: 'SOVEREIGN-EXPOSURE-HARDSTOP-1.0',
        rule_code: t.rule_code,
        rule_name: t.rule_name,
        threshold: t.threshold,
        trigger_value: t.trigger_value,
        session_phase: phase || 'unknown',
        bit_stamp_hash,
        purged: true,
        notes: notes || null,
        triggered_at: nowIso,
      });
      records.push({
        id: rec.id,
        rule_code: t.rule_code,
        rule_name: t.rule_name,
        threshold: t.threshold,
        trigger_value: t.trigger_value,
        bit_stamp_hash,
        triggered_at: nowIso,
      });
    }

    return Response.json({
      protocol: 'SOVEREIGN-EXPOSURE-HARDSTOP-1.0',
      session_id,
      bit_stamped_and_purged: true,
      evaluations,
      triggered: records,
      message: 'EXPOSURE HARD-STOP TRIGGERED. Session logic-state bit-stamped into the Truth Anchor. Purge the session buffer and start a fresh session immediately.',
    });
  } catch (error) {
    console.error('evaluateExposureHardStops error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});