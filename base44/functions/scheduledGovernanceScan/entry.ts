/**
 * scheduledGovernanceScan — runs nightly.
 * 1. Scans all published components against the Do-No-Harm Oath + safety standards.
 * 2. Updates governance scores.
 * 3. Emails each builder a personal summary of their components' governance status.
 * No user auth required — invoked by scheduler (service role).
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const DO_NO_HARM_CHECKS = [
  { id: "harm_amplification", label: "Harm amplification guard", description: "Component must not generate or amplify harmful content" },
  { id: "pii_leakage", label: "PII leakage prevention", description: "No personally identifiable data exfiltration" },
  { id: "human_oversight", label: "Human oversight preserved", description: "Escalation path exists for ambiguous decisions" },
  { id: "deception_guard", label: "Deception/manipulation guard", description: "No coercive or deceptive outputs toward end users" },
  { id: "transparency", label: "AI transparency disclosure", description: "Agent must self-identify as AI when relevant" },
  { id: "jurisdictional", label: "Jurisdictional law compliance", description: "Aligned with applicable legal frameworks" },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This is a scheduled function — no user session. Use service role throughout.
    const [components, existingScores, allUsers] = await Promise.all([
      base44.asServiceRole.entities.Component.filter({ status: "published" }),
      base44.asServiceRole.entities.GovernanceScore.list("-last_audited_at", 500),
      base44.asServiceRole.entities.User.list("-created_date", 500),
    ]);

    const scoreMap = {};
    for (const s of existingScores) scoreMap[s.component_id] = s;

    const userMap = {};
    for (const u of allUsers) userMap[u.id] = u;

    // Determine which components need re-scan
    const toAudit = components.filter(c => {
      const score = scoreMap[c.id];
      if (!score) return true;
      const ageDays = (Date.now() - new Date(score.last_audited_at).getTime()) / (1000 * 60 * 60 * 24);
      return ageDays > 7 || score.certification_status === "uncertified";
    });

    console.log(`[Scheduled] Governance scan: ${toAudit.length}/${components.length} components queued`);

    const scanResults = [];

    for (const component of toAudit) {
      // Evaluate each Do-No-Harm check with LLM
      const oathEvalPrompt = `You are a strict AI governance auditor enforcing the Magna Dev Do-No-Harm Oath.

Component under review:
- Name: ${component.name}
- Type: ${component.type}
- Category: ${component.category}
- Description: ${component.description}
- Features: ${(component.features || []).join(", ")}
- Output schema fields: ${(component.schema || []).join(", ")}

Evaluate this component against these Do-No-Harm Oath clauses. For each, return a pass/fail and severity of any violation.
Also compute a composite oath_compliance_score (0-100), ai_safety_score (0-100), pii_handling_score (0-100), and data_compliance_score (0-100).
Determine certification_status: "certified" if oath_compliance_score >= 80 and no critical flags, "pending" if 60-79, "uncertified" if < 60.

Return ONLY valid JSON — no markdown, no explanation:
{
  "oath_compliance_score": number,
  "ai_safety_score": number,
  "pii_handling_score": number,
  "data_compliance_score": number,
  "audit_trail_score": number,
  "certification_status": "certified"|"pending"|"uncertified",
  "oath_checks": {
    "harm_amplification": { "pass": boolean, "note": string },
    "pii_leakage": { "pass": boolean, "note": string },
    "human_oversight": { "pass": boolean, "note": string },
    "deception_guard": { "pass": boolean, "note": string },
    "transparency": { "pass": boolean, "note": string },
    "jurisdictional": { "pass": boolean, "note": string }
  },
  "risk_flags": [
    { "flag": string, "severity": "info"|"low"|"medium"|"high"|"critical", "description": string, "remediation": string }
  ],
  "frameworks_certified": ["SOC2"|"GDPR"|"ISO27001"|"OWASP"]
}`;

      let evalResult;
      try {
        evalResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: oathEvalPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              oath_compliance_score: { type: "number" },
              ai_safety_score: { type: "number" },
              pii_handling_score: { type: "number" },
              data_compliance_score: { type: "number" },
              audit_trail_score: { type: "number" },
              certification_status: { type: "string" },
              oath_checks: { type: "object" },
              risk_flags: { type: "array", items: { type: "object" } },
              frameworks_certified: { type: "array", items: { type: "string" } },
            },
          },
        });
      } catch (e) {
        console.warn(`LLM eval failed for ${component.name}: ${e.message}`);
        continue;
      }

      const overall = Math.round(
        (evalResult.oath_compliance_score + evalResult.ai_safety_score +
         evalResult.pii_handling_score + evalResult.data_compliance_score +
         (evalResult.audit_trail_score || 70)) / 5
      );

      const scoreData = {
        component_id: component.id,
        component_name: component.name,
        overall_score: overall,
        ai_safety_score: evalResult.ai_safety_score,
        data_compliance_score: evalResult.data_compliance_score,
        audit_trail_score: evalResult.audit_trail_score || 70,
        pii_handling_score: evalResult.pii_handling_score,
        version_stability_score: Math.max(0, 100 - (component.trust_score < 50 ? 20 : 0)),
        frameworks_certified: evalResult.frameworks_certified || [],
        risk_flags: evalResult.risk_flags || [],
        certification_status: evalResult.certification_status,
        last_audited_at: new Date().toISOString(),
        next_audit_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        auditor: "Scheduled Do-No-Harm Governance Engine v1",
      };

      const existing = scoreMap[component.id];
      if (existing) {
        await base44.asServiceRole.entities.GovernanceScore.update(existing.id, scoreData);
      } else {
        await base44.asServiceRole.entities.GovernanceScore.create(scoreData);
      }

      // Update component trust_score
      await base44.asServiceRole.entities.Component.update(component.id, {
        trust_score: overall,
        certified: evalResult.certification_status === "certified",
      });

      scanResults.push({
        component_id: component.id,
        builder_id: component.builder_id,
        name: component.name,
        overall_score: overall,
        certification_status: evalResult.certification_status,
        critical_flags: (evalResult.risk_flags || []).filter(f => f.severity === "critical").length,
        oath_checks: evalResult.oath_checks,
      });

      console.log(`[Scan] ${component.name}: ${overall}/100 (${evalResult.certification_status})`);
    }

    // Group results by builder and send summary emails
    const byBuilder = {};
    for (const r of scanResults) {
      if (!byBuilder[r.builder_id]) byBuilder[r.builder_id] = [];
      byBuilder[r.builder_id].push(r);
    }

    let emailsSent = 0;
    for (const [builderId, builderResults] of Object.entries(byBuilder)) {
      const builder = userMap[builderId];
      if (!builder?.email) continue;

      const certified = builderResults.filter(r => r.certification_status === "certified").length;
      const pending = builderResults.filter(r => r.certification_status === "pending").length;
      const uncertified = builderResults.filter(r => r.certification_status === "uncertified").length;
      const criticalTotal = builderResults.reduce((s, r) => s + r.critical_flags, 0);
      const avgScore = Math.round(builderResults.reduce((s, r) => s + r.overall_score, 0) / builderResults.length);

      const componentLines = builderResults.map(r =>
        `• ${r.name}: ${r.overall_score}/100 — ${r.certification_status.toUpperCase()}${r.critical_flags > 0 ? ` ⚠ ${r.critical_flags} critical flag(s)` : " ✓"}`
      ).join("\n");

      const oathStatus = criticalTotal === 0
        ? "✅ All your components are operating within the Do-No-Harm Oath constraints."
        : `⚠️ ${criticalTotal} critical violation(s) detected. Immediate remediation required to maintain marketplace listing.`;

      const emailBody = `Hi ${builder.full_name || "Builder"},

Your nightly Magna Dev governance scan is complete.

── GOVERNANCE SUMMARY ──────────────────────
Certified:    ${certified}
Pending:      ${pending}
Uncertified:  ${uncertified}
Avg Score:    ${avgScore}/100
Critical Flags: ${criticalTotal}

── DO-NO-HARM OATH STATUS ──────────────────
${oathStatus}

── COMPONENT BREAKDOWN ─────────────────────
${componentLines}

── WHAT THIS MEANS ─────────────────────────
Certified components receive:
  • +2–10% revenue share bonus (depending on builder tier)
  • Governance badge in marketplace listings
  • Priority placement in search results
  • Eligibility for Mastery Badge (300% visibility boost)

Uncertified components risk:
  • Temporary marketplace delisting after 14 days
  • Revenue share reduction
  • API partner routing exclusion

── ACTION REQUIRED ─────────────────────────
${uncertified > 0 || criticalTotal > 0
  ? "Please review the flagged components in your Governance Dashboard and address critical violations within 7 days."
  : "No immediate action required. Keep up the great work!"}

View full report: https://app.altshiftx.com/builder/governance

— Alt+Shift+X Governance Engine
  Magna Dev Trust Framework v1.0`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: builder.email,
        from_name: "Alt+Shift+X Governance",
        subject: `[Governance Scan] ${certified}/${builderResults.length} certified · Avg ${avgScore}/100 — ${new Date().toISOString().split("T")[0]}`,
        body: emailBody,
      });

      emailsSent++;
    }

    const summary = {
      scanned: toAudit.length,
      skipped: components.length - toAudit.length,
      certified: scanResults.filter(r => r.certification_status === "certified").length,
      pending: scanResults.filter(r => r.certification_status === "pending").length,
      uncertified: scanResults.filter(r => r.certification_status === "uncertified").length,
      critical_flags_total: scanResults.reduce((s, r) => s + r.critical_flags, 0),
      emails_sent: emailsSent,
      run_at: new Date().toISOString(),
    };

    console.log(`[Scheduled Governance Scan Complete]`, JSON.stringify(summary));
    return Response.json(summary);

  } catch (error) {
    console.error("scheduledGovernanceScan error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});